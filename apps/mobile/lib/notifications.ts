import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { supabase } from './supabase';

// Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

/**
 * Registers for push notifications and returns the token.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
    if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (!Device.isDevice) {
        console.log('Must use physical device for Push Notifications');
        // Return a fake token for development if needed, or just null
        return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
    }

    try {
        const projectId =
            Constants?.expoConfig?.extra?.eas?.projectId ??
            Constants?.easConfig?.projectId;

        // If no project ID found, it might fail, but let's try without it first or log it
        if (!projectId) {
            console.log('Project ID not found in app config');
        }

        const tokenData = await Notifications.getExpoPushTokenAsync({
            projectId,
        });

        return tokenData.data;
    } catch (e) {
        console.error('Error getting push token:', e);
        return null;
    }
}

/**
 * Saves the push token to the user's profile in Supabase.
 */
export async function savePushToken(userId: string, token: string) {
    if (!userId || !token) return;

    try {
        const { error } = await supabase
            .from('profiles')
            .update({ push_token: token })
            .eq('id', userId);

        if (error) {
            console.error('Error saving push token:', error);
        } else {
            console.log('Push token saved for user:', userId);
        }
    } catch (e) {
        console.error('Exception saving push token:', e);
    }
}

/**
 * Sends a push notification to a specific Expo push token.
 */
export async function sendPushNotification(expoPushToken: string, title: string, body: string, data: any = {}) {
    const message = {
        to: expoPushToken,
        sound: 'default',
        title,
        body,
        data,
    };

    try {
        await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        });
    } catch (e) {
        console.error('Error sending notification:', e);
    }
}
/**
 * Schedules a local notification to show immediately.
 */
export async function scheduleLocalNotification(title: string, body: string, data: any = {}) {
    try {
        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                data,
                sound: true,
            },
            trigger: null, // show immediately
        });
    } catch (e) {
        console.error('Error scheduling local notification:', e);
    }
}
