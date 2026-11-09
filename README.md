# DroidBench

เว็บค้นข้อมูลมือถือแอนดรอยด์สำหรับงานซ่อม มีรหัสล็อกหน้าเว็บ

## อัปขึ้น Vercel

ทางที่ 1: GitHub
1. สร้าง repository แบบ Private แล้วอัปไฟล์ทั้งหมดในโฟลเดอร์นี้
2. ที่ Vercel กด Add New > Project แล้วเลือก repository
3. ตั้ง Framework Preset เป็น Other แล้วกด Deploy

ทางที่ 2: คำสั่ง (ต้องมี Node.js)
    cd droidbench
    npx vercel --prod

## เปลี่ยนรหัส

รหัสเริ่มต้นคือ 2217 แนะนำให้ตั้งที่ Vercel > Settings > Environment Variables
เพิ่มชื่อ SITE_PIN ใส่รหัสใหม่ แล้วกด Redeploy

## ข้อมูลที่บันทึก

เครื่องที่บันทึกและรายชื่อที่นำเข้า เก็บในเบราว์เซอร์ของแต่ละเครื่อง
ล้างข้อมูลเบราว์เซอร์แล้วจะหายไป และไม่แชร์ข้ามเครื่อง
