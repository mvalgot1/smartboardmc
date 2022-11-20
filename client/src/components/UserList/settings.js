import { createClient, createMicrophoneAndCameraTracks } from 'agora-rtc-react';

const appId = '946c22c4770d470ca528d9e3e8c26205';
const token =
  '007eJxTYBC2dFjyIP3uxu1sXNqmbhK53olHfgaXCK5kLv2j+vRiAocCg6WJWbKRUbKJublBiom5QXKiqZFFimWqcapFspGZkYHpEr3c5IZARoYvK54zMEIhiM/F4JyRmJeXmlNSVMnAAABOhx/9';

export const config = { mode: 'rtc', codec: 'vp8', appId: appId, token: token };
export const useClient = createClient(config);
export const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();
export const channelName = 'Channeltry';
