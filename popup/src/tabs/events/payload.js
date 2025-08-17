// https://developers.sift.com/docs/curl/apis-overview
// Snippet to gather events information
// CMD + / to uncomment
//
// (() => {
//   const rgx = /^\s*\/\/\s*Sample\s+(\$\w+)\s+event[^\r\n]*/i;
//   const result = Array.from(
//     document.querySelectorAll(
//       ".prettyprint.lang.curl.code-partial.prettyprinted"
//     )
//   )
//     .map((item) => {
//       const [templateName, eventType] = item.textContent.match(rgx) || [];

//       if (!eventType) {
//         return null;
//       }

//       Array.from(item.querySelectorAll(".com")).forEach((commentNode) =>
//         commentNode.remove()
//       );

//       return { templateName, eventType, code: item.textContent.trim() };
//     })
//     .reduce((res, item) => {
//       if (!item) {
//         return res;
//       }

//       let { templateName, eventType, code } = item;

//       try {
//         code = JSON.parse(code);
//       } catch (error) {
//         console.log(`Template "${templateName}" has syntax errors.`);
//       }

//       if (!res[eventType]) res[eventType] = {};

//       res[eventType][templateName.replace(/^\s*\/\/\s*/, "")] = code;

//       return res;
//     }, {});

//   return result;
// })();

export const getCustomEventPayload = (event) => ({
  $type: event,
  $api_key: "{{YOUR_API_KEY}}",
  $browser: {
    $user_agent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36",
    $accept_language: "en-US",
    $content_language: "en-GB",
  },
  $app: {
    $os: "iOS",
    $os_version: "10.1.3",
    $device_manufacturer: "Apple",
    $device_model: "iPhone 4,2",
    $device_unique_id: "A3D261E4-DE0A-470B-9E4A-720F3D3D22E6",
    $app_name: "Calculator",
    $app_version: "3.2.7",
    $client_language: "en-US",
  },
});

export const getEventsData = () => ({});
