# Fixing Google OAuth origin_mismatch Error

## Problem

You're encountering an "Error 400: origin_mismatch" when trying to use Google OAuth for authentication. The error message indicates:

```
Access blocked: Authorization Error
You can't sign in to this app because it doesn't comply with Google's OAuth 2.0 policy.

If you're the app developer, register the JavaScript origin in the Google Cloud Console.

Error 400: origin_mismatch
```

## Solution

This error occurs when the JavaScript origin (domain) from which your application is making the OAuth request doesn't match any of the authorized origins in your Google Cloud Console project settings.

### Steps to Fix:

1. **Log in to Google Cloud Console**
   - Go to https://console.cloud.google.com/
   - Select your project

2. **Navigate to OAuth Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Find and click on the OAuth 2.0 Client ID you're using for this application

3. **Update Authorized JavaScript Origins**
   - Add `http://localhost:8080` to the list of Authorized JavaScript Origins
   - If you're accessing the application through other URLs (like IP addresses or domain names), add those as well
   - Make sure to include both HTTP and HTTPS versions if applicable
   - Include the port number if your application uses a non-standard port (as in your case with port 8080)

4. **Update Authorized Redirect URIs (if needed)**
   - Add `http://localhost:8080/auth/google/callback` to the list of Authorized Redirect URIs
   - Add any other callback URLs your application might use

5. **Save Changes**
   - Click "Save" to apply the changes
   - Note that changes may take a few minutes to propagate

## Common Mistakes to Avoid

1. **Mismatched Protocols**: Ensure you're using the correct protocol (http:// vs https://)
2. **Missing Port Numbers**: If your local development server runs on a specific port (like 8080), include it in the origins
3. **Using Different Hostnames**: If you access your app via `localhost` but have registered `127.0.0.1`, this will cause an origin mismatch
4. **Trailing Slashes**: Be careful about including or excluding trailing slashes - the origins must match exactly

## Testing the Fix

After updating your Google Cloud Console settings:

1. Restart your application
2. Try the Google login again
3. If you still encounter issues, check the browser console for more detailed error messages

## Additional Resources

- [Google OAuth 2.0 for Client-side Web Applications](https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow)
- [Troubleshoot authentication & authorization issues](https://developers.google.com/workspace/admin/reseller/v1/troubleshoot-authentication-authorization)