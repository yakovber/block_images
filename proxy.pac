function FindProxyForURL(url, host) {
    // בדיקה אם הכתובת מכילה את הדומיין הספציפי
    if (dnsDomainIs(host, "https://www.practicu.com/") ){
        return "PROXY http://block-img.yber.co.il:8080";
    }
    
    // בדיקה נוספת לכתובות שמתחילות ב-https://block-img.yber.co.il
    if (shExpMatch(url, "https://www.practicu.com") ) {
        return "PROXY http://block-img.yber.co.il:8080";
    }
    
    // כל שאר הכתובות יעברו בחיבור ישיר (ללא פרוקסי)
    return "DIRECT";
}