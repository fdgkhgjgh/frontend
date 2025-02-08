// frontend/js/utils.js

/**
 * Formats a date string into a more readable format.
 * @param {string | number | Date} dateString - The date string, timestamp, or Date object to format.
 * @returns {string} - The formatted date string (e.g., "November 21, 2023").  Returns an empty string if input is invalid.
 */
function formatDate(dateString) {
    try {
      const date = new Date(dateString);
  
      // Check if the date is valid
      if (isNaN(date)) {
          return ''; // Or some other default value, like "Invalid Date"
      }
  
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString(undefined, options); // Use user's locale
    } catch (error) {
      console.error("Error formatting date:", error);
      return ''; // Return empty string on error (or a suitable fallback)
    }
  }
  
  // Example usage (you wouldn't normally include this in utils.js,
  // it's just to show how to use the function):
  // const formattedDate = formatDate('2023-11-21T14:30:00Z');
  // console.log(formattedDate);
  
  //Make this function can be used in other files.
  export { formatDate };
  