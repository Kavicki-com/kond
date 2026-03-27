-- ================================================================
-- Trigger para enviar push notification quando uma encomenda chega
-- Execute no SQL Editor do Supabase:
-- Dashboard > SQL Editor > New Query
--
-- ANTES DE RODAR: substitua <SUA_SERVICE_ROLE_KEY> pela chave em
-- Dashboard > Settings > API > service_role (secret)
-- ================================================================

-- 1. Habilita a extensão pg_net
create extension if not exists pg_net with schema extensions;

-- 2. Cria (ou recria) a função de notificação
create or replace function notify_new_package()
returns trigger
language plpgsql
security definer
as $$
begin
  begin
    perform
      net.http_post(
        url     := 'https://nooggzakadyzgaaujjur.supabase.co/functions/v1/send-package-notification',
        body    := jsonb_build_object('record', row_to_json(new)),
        headers := jsonb_build_object(
          'Content-Type',  'application/json',
          'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vb2dnemFrYWR5emdhYXVqanVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDczMjQ1OCwiZXhwIjoyMDg2MzA4NDU4fQ.PLACEHOLDER_REPLACE_WITH_SERVICE_ROLE_KEY'
        )
      );
  exception when others then
    -- Nunca bloquear o cadastro de encomenda por falha na notificação
    raise warning 'notify_new_package error: %', sqlerrm;
  end;
  return new;
end;
$$;

-- 3. Cria o trigger
drop trigger if exists on_package_inserted on packages;
create trigger on_package_inserted
  after insert on packages
  for each row
  execute function notify_new_package();
