export function formatToIST(dateInput: string | Date | number): string {
  let date: Date;
  
  if (typeof dateInput === "string" && !dateInput.endsWith("Z") && !dateInput.includes("+")) {
    // If it's a string from backend without TZ info, assume UTC
    date = new Date(dateInput + "Z");
  } else {
    date = new Date(dateInput);
  }

  // Fallback to current date if invalid
  if (isNaN(date.getTime())) date = new Date();

  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).toUpperCase();
}
