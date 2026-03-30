import https from "https";

/**
 * 👤 Fetch Author Metadata by ID
 *
 * Retrieves author information from the central Quicksi templates registry.
 * The data is stored as a static JSON file hosted on GitHub.
 *
 * Source:
 * https://raw.githubusercontent.com/Quicksi-CLI/quicksi-templates/main/authors.json
 *
 * 📦 Use Case:
 * - Resolve template authors dynamically
 * - Display author attribution in CLI output
 * - Support a decentralized template ecosystem
 *
 * 🔐 Notes:
 * - No authentication is required (public resource)
 * - No user data is sent in this request
 * - This is a read-only operation
 *
 * ⚠️ Reliability:
 * - Network errors will reject the promise
 * - JSON parsing errors are handled and propagated
 * - Returns `null` if the author is not found
 *
 * @param authorId - Unique identifier of the author
 * @returns Promise resolving to author object or null if not found
 */
export async function getAuthorById(authorId: string): Promise<any> {
  const url =
    "https://raw.githubusercontent.com/Quicksi-CLI/quicksi-templates/main/authors.json";

  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";

        /**
         * 📥 Stream incoming data chunks
         * Accumulates response body as a string
         */
        res.on("data", (chunk) => (data += chunk));

        /**
         * ✅ Response fully received
         * Attempt to parse and extract author data
         */
        res.on("end", () => {
          try {
            const json = JSON.parse(data);

            /**
             * Expected structure:
             * {
             *   "authors": {
             *     "authorId": { ...authorData }
             *   }
             * }
             */
            const author = json.authors?.[authorId];

            // Return author object or null if not found
            resolve(author || null);
          } catch (err) {
            /**
             * ❌ JSON parsing failed
             * Likely due to malformed response
             */
            reject(err);
          }
        });
      })
      .on("error", (err) => {
        /**
         * ❌ Network or request error
         * e.g. DNS failure, connection timeout
         */
        reject(err);
      });
  });
}
