export function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return "";
  const birthDate = new Date(dateOfBirth);
  if (isNaN(birthDate.getTime())) return "";

  const today = new Date();

  // Normalize times to midnight for date-only comparison
  const birth = new Date(
    birthDate.getFullYear(),
    birthDate.getMonth(),
    birthDate.getDate()
  );
  const now = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  // Future date safeguard
  if (birth > now) {
    return "";
  }

  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  let days = now.getDate() - birth.getDate();

  if (days < 0) {
    months--;
    // Days in previous month
    const prevMonthDays = new Date(
      now.getFullYear(),
      now.getMonth(),
      0
    ).getDate();
    days += prevMonthDays;
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  // Case 1: 1 year or older
  if (years >= 1) {
    return years === 1 ? "1 year" : `${years} years`;
  }

  // Case 2: Less than a year, but 1 month or older
  if (months >= 1) {
    if (days > 0) {
      return `${months} month${months > 1 ? "s" : ""}, ${days} day${days > 1 ? "s" : ""}`;
    }
    return months === 1 ? "1 month" : `${months} months`;
  }

  // Case 3: Less than 1 month old
  if (days === 0) {
    return "Today (Newborn)";
  }
  return days === 1 ? "1 day" : `${days} days`;
}