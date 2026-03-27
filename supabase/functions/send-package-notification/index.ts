import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  try {
    // Database webhooks send a POST with a JSON body containing the record
    const payload = await req.json();
    const newPackage = payload.record;

    if (!newPackage || !newPackage.unit_id) {
      console.log("No package record or unit_id in payload, skipping.");
      return new Response("ok", { status: 200 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch all active residents for this unit who want to receive notifications
    const { data: residents, error: residentsError } = await supabase
      .from("residents")
      .select("profile_id, receives_notifications")
      .eq("unit_id", newPackage.unit_id)
      .eq("receives_notifications", true);

    if (residentsError) {
      console.error("Error fetching residents:", residentsError);
      return new Response("Error fetching residents", { status: 500 });
    }

    if (!residents || residents.length === 0) {
      console.log("No residents with notifications enabled for unit:", newPackage.unit_id);
      return new Response("ok", { status: 200 });
    }

    // Fetch push tokens for all eligible residents
    const profileIds = residents.map((r: any) => r.profile_id);
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, push_token")
      .in("id", profileIds)
      .not("push_token", "is", null);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      return new Response("Error fetching profiles", { status: 500 });
    }

    const tokens = profiles
      ?.map((p: any) => p.push_token)
      .filter(Boolean) as string[];

    if (!tokens || tokens.length === 0) {
      console.log("No push tokens found for unit residents.");
      return new Response("ok", { status: 200 });
    }

    // Build notification messages
    const messages = tokens.map((token) => ({
      to: token,
      sound: "default",
      title: "Nova Encomenda! 📦",
      body: "Uma nova encomenda chegou para você.",
      data: {
        packageId: newPackage.id,
        unitId: newPackage.unit_id,
      },
    }));

    // Send via Expo Push API
    const expoResponse = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });

    if (!expoResponse.ok) {
      const errText = await expoResponse.text();
      console.error("Expo push error:", errText);
      return new Response("Expo push error", { status: 500 });
    }

    const expoResult = await expoResponse.json();
    console.log("Expo push result:", JSON.stringify(expoResult));

    return new Response("ok", { status: 200 });
  } catch (err: any) {
    console.error("send-package-notification error:", err);
    return new Response(err.message || "Internal server error", { status: 500 });
  }
});
