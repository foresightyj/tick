export function get_now(): Date {
    const now = new Date();
    return now;
}

export function get_tonight() {
    const now = get_now();
    let tonight = new Date(now.toLocaleDateString());
    tonight.setHours(18); // 6pm tonight
    if (tonight < now) {
        // already evening, change to 1 hour later
        tonight = now;
        tonight.setHours(tonight.getHours() + 1);
    }
    return tonight;
}

export function get_tomorrow() {
    const tomorrow = new Date(new Date().toLocaleDateString());
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9); // 9am tomorrow morning
    return tomorrow;
}
