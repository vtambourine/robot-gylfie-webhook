/**
 *
 * @param string
 * @returns {String[]}
 */
export function parseIssues(string) {
    return string.match(/[A-Z]+-[0-9]+/g) || [];
}
