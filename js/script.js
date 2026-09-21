/* =========================================
   VIQ MOTOR EMPIRE
   CONFIGURATION
========================================= */

const BUSINESS_NAME = "VIQ Motor Empire";

/*
 * IMPORTANT:
 * Replace with your real WhatsApp number.
 *
 * Malaysia format:
 * 60123456789
 *
 * Do not include:
 * +
 * spaces
 * hyphens
 */
const WHATSAPP_NUMBER = "+60193404180";

const PHONE_NUMBER = "+60193404180";

const BUSINESS_LOCATION =
    "Cyberjaya, Subang Jaya, Kuala Lumpur & Selangor";
const PICKUP_LOCATION =
    "Cyberjaya, Selangor";

const FLEET_WEB_APP_URL =
    "https://script.google.com/macros/s/AKfycbxX5rdy2yq_su71TKJjQ6TiN71bJUbgqG0hMJD7zud7dtWaDtj2uC7S8Zey2D4DWG9nIQ/exec";
const FLEET_CACHE_KEY = "viq-fleet-cache";
const FLEET_CACHE_TTL_MS = 5 * 60 * 1000;
window.viqFleetWebAppUrl = FLEET_WEB_APP_URL;


/* =========================================
   CAR INVENTORY
========================================= */

let cars = [];

function isFleetConfigured() {
    return FLEET_WEB_APP_URL.startsWith("https://script.google.com/");
}

function setFleetStatus(message, canRetry = false) {
    const status = document.getElementById("fleet-status");

    if (!status) {
        return;
    }

    if (!message) {
        status.hidden = true;
        status.replaceChildren();
        return;
    }

    status.hidden = false;
    status.innerHTML = `<span>${message}</span>${canRetry ? '<button type="button" id="fleet-retry">Retry</button>' : ""}`;

    status.querySelector("#fleet-retry")?.addEventListener("click", () => {
        loadFleetData(true);
    });
}

function getLocalCarImage(carName) {
    const name = String(carName || "").toLowerCase();

    if (name.includes("myvi")) {
        return "cars/myvi.webp";
    }

    if (name.includes("altis")) {
        return "cars/altis.webp";
    }

    return null;
}

function normalizeFleetCar(row, index) {
    const name = String(row["Car Name"] ?? row.name ?? "Unnamed vehicle");
    const price = Number(String(row["Price Per Day"] ?? row.price ?? 0).replace(/[^0-9.]/g, ""));
    const pickupLocation = String(row["Pickup Location(s)"] ?? row.pickupLocation ?? PICKUP_LOCATION).split(",")[0].trim();
    const category = String(row.Category ?? row.category ?? "sedan").trim().toLowerCase();

    return {
        id: name || String(index + 1),
        name,
        image: getLocalCarImage(name) || row["Image URL"] || row.image || null,
        price: `RM${price}/day`,
        year: String(row.Year ?? row.year ?? "-") || "-",
        category,
        transmission: String(row.Transmission ?? row.transmission ?? "Automatic"),
        fuel: String(row.Fuel ?? row.fuel ?? "Petrol"),
        seats: String(row.Seats ?? row.seats ?? "5 Seats"),
        availability: String(row.Status ?? row.availability ?? "Available"),
        pickupLocation,
        tags: String(row.Tags ?? row.tags ?? "").split(",").map(tag => tag.trim()).filter(Boolean),
        description: String(row.Description ?? row.description ?? "Contact us for vehicle details.")
    };
}

async function loadFleetData(forceRefresh = false) {
    if (!isFleetConfigured()) {
        setFleetStatus("Fleet data is not configured yet. Add the Apps Script Web App URL in js/script.js.");
        return false;
    }

    if (!forceRefresh) {
        try {
            const cached = JSON.parse(localStorage.getItem(FLEET_CACHE_KEY) || "null");
            if (cached && Date.now() - cached.timestamp < FLEET_CACHE_TTL_MS) {
                cars = cached.cars;
                renderCars();
                initializeFleetFilters();
                setFleetStatus("");
                return true;
            }
        } catch (error) {
            localStorage.removeItem(FLEET_CACHE_KEY);
        }
    }

    setFleetStatus("Loading available cars...");

    try {
        const response = await fetch(`${FLEET_WEB_APP_URL}?action=fleet`, { cache: "no-store" });
        if (!response.ok) {
            throw new Error(`Fleet request failed with ${response.status}`);
        }

        const data = await response.json();
        cars = (Array.isArray(data) ? data : data.fleet || []).map(normalizeFleetCar);
        localStorage.setItem(FLEET_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), cars }));
        renderCars();
        initializeFleetFilters();
        setFleetStatus("");
        return true;
    } catch (error) {
        cars = [];
        if (carsGrid) {
            carsGrid.innerHTML = "";
        }
        setFleetStatus("We could not load the fleet right now. Please try again.", true);
        return false;
    }
}


/* =========================================
   DOM ELEMENTS
========================================= */

const carsGrid =
    document.getElementById("cars-grid");

const fleetNextButton =
    document.getElementById("fleet-next");

const fleetPreviousButton =
    document.getElementById("fleet-prev");

function scrollFleet(direction) {
    if (!carsGrid) {
        return;
    }

        const firstCard = carsGrid.querySelector(".car-card");
        const cardStep = firstCard
            ? firstCard.getBoundingClientRect().width + 18
            : carsGrid.clientWidth;

        carsGrid.scrollBy({
            left: direction * cardStep,
            behavior: "smooth"
        });
}

if (fleetNextButton) {
    fleetNextButton.addEventListener("click", () => scrollFleet(1));
}

if (fleetPreviousButton) {
    fleetPreviousButton.addEventListener("click", () => scrollFleet(-1));
}

const modal =
    document.getElementById("car-modal");

const modalClose =
    document.getElementById("modal-close");

const modalCarImage =
    document.getElementById("modal-car-image");

const modalCarName =
    document.getElementById("modal-car-name");

const modalPrice =
    document.getElementById("modal-price");

const modalAvailability =
    document.getElementById("modal-availability");

const modalDescription =
    document.getElementById("modal-description");

const modalSpecs =
    document.getElementById("modal-specs");

const modalWhatsapp =
    document.getElementById("modal-whatsapp");

const siteHeader =
    document.getElementById("site-header");

const menuToggle =
    document.getElementById("menu-toggle");

const navLinks =
    document.getElementById("nav-links");

const languageSwitcher =
    document.getElementById("language-switcher");

const languageOptions = {
    en: { code: "EN", label: "English", nav: ["Home", "Car Fleet", "Contact"] },
    ms: { code: "BM", label: "Bahasa Melayu", nav: ["Laman Utama", "Senarai Kereta", "Hubungi"] },
    zh: { code: "中", label: "中文", nav: ["首页", "车辆系列", "联系我们"] }
};

const pageTranslations = {
    ms: {
        "YOUR JOURNEY, OUR PRIORITY": "PERJALANAN ANDA, KEUTAMAAN KAMI",
        "Premium Car Rental.": "Sewaan Kereta Premium.",
        "Every Step of the Way": "Di Setiap Langkah",
        "Fast booking, no hidden fees, and 100+ cars delivered across Kuala Lumpur.": "Tempahan pantas, tanpa caj tersembunyi dan lebih 100 kereta dihantar di seluruh Kuala Lumpur.",
        "View Available Cars": "Lihat Kereta Tersedia",
        "WhatsApp Us": "WhatsApp Kami",
        "Ready-to-rent cars": "Kereta sedia untuk disewa",
        "for city trips": "untuk perjalanan bandar",
        "Clear daily rates": "Kadar harian yang jelas",
        "before you book": "sebelum membuat tempahan",
        "Direct WhatsApp support": "Sokongan WhatsApp terus",
        "when you need it": "apabila anda memerlukannya",
        "Estimated Quotation": "Anggaran Harga",
        "Get a quick price for your trip in under 15 seconds.": "Dapatkan anggaran harga perjalanan anda dalam masa kurang 15 saat.",
        "Choose Your Car": "Pilih Kereta Anda",
        "Find the right car for your trip, daily commute or long-term rental.": "Cari kereta yang sesuai untuk perjalanan, ulang-alik harian atau sewaan jangka panjang anda.",
        "CURATED THIS WEEK": "PILIHAN MINGGU INI",
        "Popular rentals this week": "Sewaan popular minggu ini",
        "Hand-picked cars for your next journey — ready when you are.": "Kereta pilihan untuk perjalanan anda yang seterusnya, sedia untuk anda.",
        "Want more options?": "Mahukan lebih banyak pilihan?",
        "See all cars": "Lihat semua kereta",
        "HOW IT WORKS": "CARA IA BERFUNGSI",
        "3 Simple Steps,": "3 Langkah Mudah,",
        "to Get You on the Road": "Untuk Memulakan Perjalanan",
        "From booking to return, we make car rental easy and hassle-free.": "Daripada tempahan hingga pemulangan, kami menjadikan sewaan kereta mudah dan lancar.",
        "See All Cars": "Lihat Semua Kereta",
        "SIMPLE BOOKING": "TEMPAHAN MUDAH",
        "Choose Your Car": "Pilih Kereta Anda",
        "Message Us on WhatsApp": "Mesej Kami di WhatsApp",
        "Confirm Your Booking": "Sahkan Tempahan Anda",
        "Browse our available vehicles and select the one that fits your needs.": "Layari kenderaan yang tersedia dan pilih yang sesuai dengan keperluan anda.",
        "Browse available cars": "Layari kereta yang tersedia",
        "Choose your rental dates": "Pilih tarikh sewaan anda",
        "Tell us your requirements": "Beritahu kami keperluan anda",
        "Click the WhatsApp button and tell us your rental dates and requirements.": "Klik butang WhatsApp dan beritahu kami tarikh sewaan serta keperluan anda.",
        "Share pickup details": "Kongsi maklumat pengambilan",
        "Get availability checked": "Semak ketersediaan",
        "Receive a quick reply": "Terima balasan pantas",
        "We'll confirm availability, pricing, documents and pickup details with you.": "Kami akan mengesahkan ketersediaan, harga, dokumen dan maklumat pengambilan dengan anda.",
        "Confirm the final price": "Sahkan harga akhir",
        "Complete booking details": "Lengkapkan maklumat tempahan",
        "Collect or receive your car": "Ambil atau terima kereta anda",
        "Affordable Rates": "Harga Berpatutan",
        "Clean & Reliable Vehicles": "Kenderaan Bersih & Dipercayai",
        "Fast WhatsApp Booking": "Tempahan WhatsApp Pantas",
        "READY TO RENT?": "SEDIA UNTUK MENYEWA?",
        "Find Your Car Today.": "Cari Kereta Anda Hari Ini.",
        "Chat with Us on WhatsApp": "Sembang dengan Kami di WhatsApp",
        "BOOKING & ENQUIRY": "TEMPAHAN & PERTANYAAN",
        "Need a car? Let us check for you.": "Perlukan kereta? Biar kami semak untuk anda.",
        "Need a car?": "Perlukan kereta?",
        "Let us check for you.": "Biar kami semak untuk anda.",
        "Browse our fleet,": "Layari armada kami,",
        "find your perfect car.": "cari kereta sempurna anda.",
        "Quality cars, transparent pricing, trusted by thousands.": "Kereta berkualiti, harga telus, dipercayai ramai.",
        "Find your perfect car": "Cari kereta sempurna anda",
        "Filter and compare cars that suit your trip.": "Tapis dan bandingkan kereta yang sesuai untuk perjalanan anda.",
        "Vehicle Type": "Jenis Kenderaan",
        "All Cars": "Semua Kereta",
        "Economy": "Ekonomi",
        "Sedan": "Sedan",
        "SUV": "SUV",
        "MPV": "MPV",
        "Price Range": "Julat Harga",
        "Transmission": "Transmisi",
        "Automatic": "Automatik",
        "Manual": "Manual",
        "Fuel Type": "Jenis Bahan Api",
        "Petrol": "Petrol",
        "Features": "Ciri-ciri",
        "Tell us what you need.": "Beritahu kami keperluan anda.",
        "START A CONVERSATION": "MULAKAN PERBUALAN",
        "Frequently asked questions": "Soalan lazim",
        "Frequently asked": "Soalan",
        "questions": "lazim",
        "Frequently Asked Questions": "Soalan Lazim",
        "BEFORE YOU MESSAGE": "SEBELUM ANDA MESEJ",
        "Everything you need to know before booking.": "Semua yang perlu anda tahu sebelum membuat tempahan.",
        "Ask us on WhatsApp": "Tanya kami di WhatsApp",
        "Send Enquiry": "Hantar Pertanyaan",
        "FROM": "DARI",
        "Check Availability": "Semak Ketersediaan",
        "Photo coming soon": "Foto akan datang",
        "Start date": "Tarikh mula",
        "End date": "Tarikh tamat",
        "Car type": "Jenis kereta",
        "Pickup area": "Kawasan ambil",
        "Estimated quote": "Anggaran harga",
        "Get Estimated Quotation on WhatsApp": "Dapatkan Anggaran Harga di WhatsApp",
        "Choose your dates and a car to preview the estimate.": "Pilih tarikh dan kereta untuk melihat anggaran.",
        "Rental Made Simple": "Sewaan Mudah",
        "How It Works": "Cara Ia Berfungsi",
        "Your name": "Nama anda",
        "WhatsApp number": "Nombor WhatsApp",
        "Pickup date": "Tarikh ambil",
        "Return date": "Tarikh pulang",
        "Pickup / delivery area": "Kawasan ambil / penghantaran",
        "Preferred car or type": "Kereta atau jenis pilihan",
        "Message": "Mesej",
        "Choose an area": "Pilih kawasan",
        "What happens next": "Apa yang berlaku seterusnya",
        "What helps us check faster": "Maklumat yang membantu kami menyemak lebih pantas",
        "View on Google Maps": "Lihat di Google Maps",
        "How do I check car availability?": "Bagaimana saya menyemak ketersediaan kereta?",
        "Do you offer delivery?": "Adakah anda menawarkan penghantaran?",
        "Can I rent daily, weekly or monthly?": "Bolehkah saya menyewa secara harian, mingguan atau bulanan?",
        "Do you offer a chauffeur service?": "Adakah anda menawarkan perkhidmatan pemandu?",
        "What do I need to prepare before booking?": "Apakah yang perlu saya sediakan sebelum membuat tempahan?",
        "Is the final price confirmed on WhatsApp?": "Adakah harga akhir disahkan di WhatsApp?"
        ,"Let’s get you": "Mari bantu anda",
        "Let's get you": "Mari bantu anda",
        "on the road.": "ke destinasi.",
        "Reliable Cars. Affordable Rates. Easy Booking.": "Kereta Dipercayai. Harga Berpatutan. Tempahan Mudah.",
        "Quick Links": "Pautan Pantas",
        "Home": "Laman Utama",
        "Our Cars": "Kereta Kami",
        "Why Choose Us": "Mengapa Pilih Kami",
        "How It Works": "Cara Ia Berfungsi",
        "FAQ": "Soalan Lazim",
        "Contact": "Hubungi",
        "WhatsApp": "WhatsApp",
        "Phone": "Telefon",
        "Information": "Maklumat",
        "Terms & Conditions": "Terma & Syarat",
        "Privacy Policy": "Dasar Privasi",
        "Direct support": "Sokongan terus",
        "Facebook ↗": "Facebook ↗",
        "Instagram ↗": "Instagram ↗",
        "Back to top": "Kembali ke atas",
        "All rights reserved.": "Hak cipta terpelihara.",
        "VIQ Motor Empire. All rights reserved.": "VIQ Motor Empire. Hak cipta terpelihara.",
        "Car Rental in Cyberjaya, Subang Jaya, Kuala Lumpur & Selangor": "Sewaan Kereta di Cyberjaya, Subang Jaya, Kuala Lumpur & Selangor",
        "Tell us what you need and we'll help you find the right rental option.": "Beritahu kami keperluan anda dan kami akan membantu mencari pilihan sewaan yang sesuai.",
        "Rental date and duration": "Tarikh dan tempoh sewaan",
        "Preferred car or passenger count": "Kereta pilihan atau bilangan penumpang",
        "Flight number or special requests": "Nombor penerbangan atau permintaan khas",
        "No payment is required at this stage. We confirm availability first.": "Tiada bayaran diperlukan pada peringkat ini. Kami akan mengesahkan ketersediaan dahulu.",
        "Send your dates & pickup area": "Hantar tarikh dan kawasan pengambilan anda",
        "We check live car availability": "Kami menyemak ketersediaan kereta secara langsung",
        "Confirm & arrange delivery on WhatsApp": "Sahkan dan atur penghantaran di WhatsApp",
        "Quick answers to what people ask most before booking. Can’t find yours? Our team replies on WhatsApp in about 10 minutes.": "Jawapan pantas kepada soalan lazim sebelum membuat tempahan. Tidak menjumpai jawapan anda? Pasukan kami membalas di WhatsApp dalam kira-kira 10 minit.",
        "Send us your dates and the car you’re interested in via the enquiry form or WhatsApp. We check the live schedule and confirm whether it’s available, usually within about 10 minutes during opening hours.": "Hantar tarikh dan kereta pilihan anda melalui borang pertanyaan atau WhatsApp. Kami menyemak jadual langsung dan mengesahkan ketersediaannya, biasanya dalam kira-kira 10 minit pada waktu operasi.",
        "Yes. Delivery and pickup options are available across selected areas in Kuala Lumpur and Selangor.": "Ya. Pilihan penghantaran dan pengambilan tersedia di kawasan terpilih di Kuala Lumpur dan Selangor.",
        "Yes. We offer flexible rental periods, subject to vehicle availability and your requirements.": "Ya. Kami menawarkan tempoh sewaan fleksibel, tertakluk kepada ketersediaan kenderaan dan keperluan anda.",
        "Prepare your preferred dates, pickup area, contact number and a valid driving licence for the booking process.": "Sediakan tarikh pilihan, kawasan pengambilan, nombor telefon dan lesen memandu yang sah untuk proses tempahan.",
        "Yes. We confirm availability, rental pricing and any delivery details with you before you decide.": "Ya. Kami mengesahkan ketersediaan, harga sewaan dan maklumat penghantaran sebelum anda membuat keputusan."
    },
    zh: {
        "YOUR JOURNEY, OUR PRIORITY": "您的旅程，我们的优先",
        "Premium Car Rental.": "优质汽车租赁。",
        "Every Step of the Way": "一路相伴",
        "View Available Cars": "查看可租车辆",
        "WhatsApp Us": "通过 WhatsApp 联系我们",
        "Estimated Quotation": "预计报价",
        "Choose Your Car": "选择您的车辆",
        "CURATED THIS WEEK": "本周精选",
        "Popular rentals this week": "本周热门租赁",
        "See all cars": "查看所有车辆",
        "HOW IT WORKS": "使用方式",
        "3 Simple Steps,": "简单三步，",
        "to Get You on the Road": "开启您的旅程",
        "See All Cars": "查看所有车辆",
        "SIMPLE BOOKING": "轻松预订",
        "Message Us on WhatsApp": "通过 WhatsApp 给我们留言",
        "Confirm Your Booking": "确认您的预订",
        "READY TO RENT?": "准备租车了吗？",
        "Find Your Car Today.": "今天就找到您的车辆。",
        "Chat with Us on WhatsApp": "在 WhatsApp 上与我们聊天",
        "BOOKING & ENQUIRY": "预订与咨询",
        "Need a car? Let us check for you.": "需要车辆吗？让我们为您查询。",
        "Need a car?": "需要车辆吗？",
        "Let us check for you.": "让我们为您查询。",
        "Browse our fleet,": "浏览我们的车队，",
        "find your perfect car.": "找到您的理想车辆。",
        "Quality cars, transparent pricing, trusted by thousands.": "优质车辆，价格透明，值得信赖。",
        "Find your perfect car": "找到您的理想车辆",
        "Filter and compare cars that suit your trip.": "筛选并比较适合您旅程的车辆。",
        "Vehicle Type": "车辆类型",
        "All Cars": "所有车辆",
        "Economy": "经济型",
        "Price Range": "价格范围",
        "Transmission": "变速箱",
        "Automatic": "自动挡",
        "Manual": "手动挡",
        "Fuel Type": "燃油类型",
        "Petrol": "汽油",
        "Features": "特色",
        "Tell us what you need.": "告诉我们您的需求。",
        "START A CONVERSATION": "开始对话",
        "Frequently asked questions": "常见问题",
        "Frequently asked": "常见",
        "questions": "问题",
        "Frequently Asked Questions": "常见问题",
        "BEFORE YOU MESSAGE": "联系我们之前",
        "Ask us on WhatsApp": "在 WhatsApp 上咨询",
        "Send Enquiry": "发送咨询",
        "FROM": "起价",
        "Check Availability": "查询可用性",
        "Photo coming soon": "照片即将推出",
        "Start date": "开始日期",
        "End date": "结束日期",
        "Car type": "车辆类型",
        "Pickup area": "取车区域",
        "Estimated quote": "预计报价",
        "Get Estimated Quotation on WhatsApp": "在 WhatsApp 获取预计报价",
        "Choose your dates and a car to preview the estimate.": "选择日期和车辆以查看预计价格。",
        "Rental Made Simple": "轻松租车",
        "How It Works": "使用方式",
        "Your name": "您的姓名",
        "WhatsApp number": "WhatsApp 号码",
        "Pickup date": "取车日期",
        "Return date": "还车日期",
        "Pickup / delivery area": "取车 / 送车区域",
        "Preferred car or type": "偏好的车辆或类型",
        "Message": "留言",
        "Choose an area": "选择区域",
        "What happens next": "接下来会怎样",
        "What helps us check faster": "帮助我们更快查询的信息",
        "View on Google Maps": "在 Google 地图中查看",
        "How do I check car availability?": "如何查询车辆是否有空？",
        "Do you offer delivery?": "你们提供送车服务吗？",
        "Can I rent daily, weekly or monthly?": "可以按日、周或月租车吗？",
        "Do you offer a chauffeur service?": "你们提供司机服务吗？",
        "What do I need to prepare before booking?": "预订前需要准备什么？",
        "Is the final price confirmed on WhatsApp?": "最终价格会在 WhatsApp 上确认吗？"
        ,"Let’s get you": "让我们带您",
        "Let's get you": "让我们带您",
        "on the road.": "踏上旅程。",
        "Reliable Cars. Affordable Rates. Easy Booking.": "可靠车辆。价格实惠。轻松预订。",
        "Quick Links": "快速链接",
        "Home": "首页",
        "Our Cars": "我们的车辆",
        "Why Choose Us": "为什么选择我们",
        "How It Works": "使用方式",
        "FAQ": "常见问题",
        "Contact": "联系我们",
        "WhatsApp": "WhatsApp",
        "Phone": "电话",
        "Information": "信息",
        "Terms & Conditions": "条款与条件",
        "Privacy Policy": "隐私政策",
        "Direct support": "直接支持",
        "Back to top": "返回顶部",
        "All rights reserved.": "版权所有。",
        "VIQ Motor Empire. All rights reserved.": "VIQ Motor Empire。版权所有。",
        "Car Rental in Cyberjaya, Subang Jaya, Kuala Lumpur & Selangor": "Cyberjaya、Subang Jaya、吉隆坡及雪兰莪汽车租赁",
        "Fast booking, no hidden fees, and 100+ cars delivered across Kuala Lumpur.": "快速预订，无隐藏费用，100 多辆车辆覆盖吉隆坡配送。",
        "Ready-to-rent cars": "随时可租的车辆",
        "for city trips": "适合城市出行",
        "Clear daily rates": "清晰的每日价格",
        "before you book": "预订前了解",
        "Direct WhatsApp support": "直接 WhatsApp 支持",
        "when you need it": "随时为您服务",
        "Browse our available vehicles and select the one that fits your needs.": "浏览现有车辆，选择符合您需求的车型。",
        "Browse available cars": "浏览现有车辆",
        "Choose your rental dates": "选择租车日期",
        "Tell us your requirements": "告诉我们您的需求",
        "Click the WhatsApp button and tell us your rental dates and requirements.": "点击 WhatsApp 按钮，告诉我们您的租车日期和需求。",
        "Share pickup details": "提供取车详情",
        "Get availability checked": "查询车辆可用性",
        "Receive a quick reply": "快速收到回复",
        "We'll confirm availability, pricing, documents and pickup details with you.": "我们会与您确认车辆可用性、价格、文件和取车详情。",
        "Confirm the final price": "确认最终价格",
        "Complete booking details": "完成预订资料",
        "Collect or receive your car": "取车或接收车辆",
        "Tell us what you need and we'll help you find the right rental option.": "告诉我们您的需求，我们会帮您找到合适的租车方案。",
        "Rental date and duration": "租车日期和时长",
        "Preferred car or passenger count": "首选车型或乘客人数",
        "Flight number or special requests": "航班号或特殊要求",
        "No payment is required at this stage. We confirm availability first.": "现阶段无需付款。我们会先确认车辆可用性。",
        "Send your dates & pickup area": "发送日期和取车区域",
        "We check live car availability": "我们查询实时车辆可用性",
        "Confirm & arrange delivery on WhatsApp": "在 WhatsApp 确认并安排配送",
        "Quick answers to what people ask most before booking. Can’t find yours? Our team replies on WhatsApp in about 10 minutes.": "这里解答预订前最常见的问题。找不到您想问的？我们的团队通常会在约 10 分钟内通过 WhatsApp 回复。",
        "Send us your dates and the car you’re interested in via the enquiry form or WhatsApp. We check the live schedule and confirm whether it’s available, usually within about 10 minutes during opening hours.": "请通过咨询表格或 WhatsApp 发送日期和感兴趣的车型。我们会查询实时安排并确认可用性，营业时间内通常约 10 分钟回复。",
        "Yes. Delivery and pickup options are available across selected areas in Kuala Lumpur and Selangor.": "可以。吉隆坡和雪兰莪指定地区提供配送和取车服务。",
        "Yes. We offer flexible rental periods, subject to vehicle availability and your requirements.": "可以。我们提供灵活的租车时长，具体取决于车辆可用性和您的需求。",
        "Prepare your preferred dates, pickup area, contact number and a valid driving licence for the booking process.": "请准备首选日期、取车区域、联系电话和有效驾驶执照，以便完成预订。",
        "Yes. We confirm availability, rental pricing and any delivery details with you before you decide.": "可以。我们会在您决定前确认车辆可用性、租车价格和配送详情。"
    }
};

const originalTextNodes = new WeakMap();
const originalAttributes = new WeakMap();

const legalPageTranslations = {
    en: {
        kicker: "VEHICLE RENTAL TERMS & CONDITIONS",
        company: "VIQ MOTOR EMPIRE",
        registrationLabel: "Registration No.",
        registrationValue: "202603097176 (IP0623975-W)",
        ownerLabel: "Owner",
        ownerValue: "NGOI YE SHENG",
        addressLabel: "Business Address",
        addressValue: "Jalan Teknokrat 1, Cyberjaya, 63000 Cyberjaya, Selangor, Malaysia",
        phoneLabel: "Phone",
        emailLabel: "Email",
        effectiveLabel: "Effective Date",
        effectiveValue: "[Insert Date]",
        intro: "These Vehicle Rental Terms & Conditions (\"Terms\") govern the rental and use of vehicles provided by VIQ MOTOR EMPIRE (\"Owner\", \"we\", \"us\", or \"our\") to the person renting the vehicle (\"Renter\", \"you\", or \"your\").",
        intro2: "By making a booking, making payment, accepting delivery of a vehicle, or signing a Vehicle Rental Agreement, you confirm that you have read, understood and agreed to these Terms.",
        section1: "1. Booking & Rental Agreement",
        section2: "2. Renter Eligibility & Documents",
        section3: "3. Vehicle Condition & Inspection",
        section4: "4. Rental Period",
        section5: "5. Rental Fees & Payment",
        section6: "6. Security Deposit",
        section7: "7. Authorised Drivers",
        section8: "8. Prohibited Use",
        section9: "9. Cross-Border Travel",
        section10: "10. Accidents, Damage & Breakdowns",
        section11: "11. Damage & Renter Responsibility",
        section12: "12. Downtime / Loss of Use",
        section13: "13. Traffic Fines, Summons, Parking & Tolls",
        section14: "14. Vehicle Tracking & Security Systems",
        section15: "15. Failure to Return the Vehicle",
        section16: "16. Termination of Rental",
        section17: "17. Cancellation & Refunds",
        section18: "18. Personal Information & Documents",
        section19: "19. Photographs, Video & Evidence",
        section20: "20. Vehicle Availability & Substitution",
        section21: "21. Breakdown & Mechanical Issues",
        section22: "22. Renter's Duty of Care",
        section23: "23. Owner's Rights",
        section24: "24. Limitation of Liability",
        section25: "25. Force Majeure",
        section26: "26. Governing Law",
        section27: "27. Severability",
        section28: "28. Entire Agreement",
        section29: "29. Acknowledgement & Acceptance"
    },
    ms: {
        kicker: "TERMA & SYARAT SEWA KENDERAAN",
        company: "VIQ MOTOR EMPIRE",
        registrationLabel: "No. Pendaftaran",
        registrationValue: "202603097176 (IP0623975-W)",
        ownerLabel: "Pemilik",
        ownerValue: "NGOI YE SHENG",
        addressLabel: "Alamat Perniagaan",
        addressValue: "Jalan Teknokrat 1, Cyberjaya, 63000 Cyberjaya, Selangor, Malaysia",
        phoneLabel: "Telefon",
        emailLabel: "Emel",
        effectiveLabel: "Tarikh Berkuat Kuasa",
        effectiveValue: "[Masukkan Tarikh]",
        intro: "Terma dan Syarat Sewa Kenderaan ini mengawal sewa dan penggunaan kenderaan yang disediakan oleh VIQ MOTOR EMPIRE (\"Pemilik\", \"kami\", \"kita\", atau \"kami\") kepada individu yang menyewa kenderaan tersebut (\"Penyewa\", \"anda\", atau \"anda\").",
        intro2: "Dengan membuat tempahan, membuat pembayaran, menerima serahan kenderaan, atau menandatangani Perjanjian Sewa Kenderaan, anda mengesahkan bahawa anda telah membaca, memahami dan bersetuju dengan Terma ini.",
        section1: "1. Tempahan & Perjanjian Sewaan",
        section2: "2. Kelayakan & Dokumen Penyewa",
        section3: "3. Keadaan Kenderaan & Pemeriksaan",
        section4: "4. Tempoh Sewaan",
        section5: "5. Bayaran Sewaan & Bayaran",
        section6: "6. Deposit Keselamatan",
        section7: "7. Pemandu Sah",
        section8: "8. Penggunaan yang Dilarang",
        section9: "9. Perjalanan Merentasi Sempadan",
        section10: "10. Kemalangan, Kerosakan & Kerosakan",
        section11: "11. Tanggungjawab Kerosakan & Penyewa",
        section12: "12. Downtime / Kehilangan Penggunaan",
        section13: "13. Denda Trafik, saman, Tempat Letak Kereta & Tol",
        section14: "14. Sistem Jejak & Keselamatan Kenderaan",
        section15: "15. Kegagalan Mengembalikan Kenderaan",
        section16: "16. Penamatan Sewaan",
        section17: "17. Pembatalan & Bayaran Balik",
        section18: "18. Maklumat Peribadi & Dokumen",
        section19: "19. Foto, Video & Bukti",
        section20: "20. Ketersediaan & Penggantian Kenderaan",
        section21: "21. Masalah Kerosakan & Mekanikal",
        section22: "22. Tanggungjawab Penjagaan Penyewa",
        section23: "23. Hak Pemilik",
        section24: "24. Had Liabiliti",
        section25: "25. Force Majeure",
        section26: "26. Undang-undang yang Mengawal",
        section27: "27. Kebolehpisahan",
        section28: "28. Perjanjian Penuh",
        section29: "29. Pengakuan & Penerimaan"
    },
    zh: {
        kicker: "车辆租赁条款与条件",
        company: "VIQ MOTOR EMPIRE",
        registrationLabel: "注册号",
        registrationValue: "202603097176 (IP0623975-W)",
        ownerLabel: "所有者",
        ownerValue: "NGOI YE SHENG",
        addressLabel: "营业地址",
        addressValue: "Jalan Teknokrat 1, Cyberjaya, 63000 Cyberjaya, Selangor, Malaysia",
        phoneLabel: "电话",
        emailLabel: "电子邮件",
        effectiveLabel: "生效日期",
        effectiveValue: "[插入日期]",
        intro: "这些车辆租赁条款与条件（\"条款\"）规范 VIQ MOTOR EMPIRE（\"所有者\"、\"我们\" 或 \"我方\"）向租赁车辆的个人（\"承租人\"、\"您\" 或 \"您的\"）提供的车辆租赁和使用。",
        intro2: "通过预订、付款、接受交付车辆或签署车辆租赁协议，您确认您已阅读、理解并同意这些条款。",
        section1: "1. 预订与租赁协议",
        section2: "2. 承租人资格与文件",
        section3: "3. 车辆状况与检查",
        section4: "4. 租期",
        section5: "5. 租金与付款",
        section6: "6. 保证金",
        section7: "7. 经授权驾驶员",
        section8: "8. 禁止使用",
        section9: "9. 跨境旅行",
        section10: "10. 事故、损坏与故障",
        section11: "11. 损害与承租人责任",
        section12: "12. 停机 / 使用损失",
        section13: "13. 交通罚单、传票、停车及通行费",
        section14: "14. 车辆追踪与安全系统",
        section15: "15. 未按时归还车辆",
        section16: "16. 租约终止",
        section17: "17. 取消与退款",
        section18: "18. 个人信息与文件",
        section19: "19. 照片、视频与证据",
        section20: "20. 车辆可用性与替换",
        section21: "21. 故障与机械问题",
        section22: "22. 承租人的照护义务",
        section23: "23. 所有者权利",
        section24: "24. 责任限制",
        section25: "25. 不可抗力",
        section26: "26. 适用法律",
        section27: "27. 可分割性",
        section28: "28. 完整协议",
        section29: "29. 确认与接受"
    }
};

const legalPageMarkup = {
    en: document.querySelector(".legal-content")?.innerHTML || "",
    ms: `
        <p class="legal-kicker">TERMA &amp; SYARAT SEWA KENDERAAN</p>
        <h1>VIQ MOTOR EMPIRE</h1>
        <div class="legal-meta">
            <p><strong>No. Pendaftaran:</strong> 202603097176 (IP0623975-W)</p>
            <p><strong>Pemilik:</strong> NGOI YE SHENG</p>
            <p><strong>Alamat Perniagaan:</strong> Jalan Teknokrat 1, Cyberjaya, 63000 Cyberjaya, Selangor, Malaysia</p>
            <p><strong>Telefon:</strong> +60198434513 / +60193404180 / +60147143193</p>
            <p><strong>Emel:</strong> <a href="mailto:motoviq@gmail.com">motoviq@gmail.com</a></p>
            <p><strong>Tarikh Berkuat Kuasa:</strong> [Masukkan Tarikh]</p>
        </div>

        <p>Terma dan Syarat Sewa Kenderaan ini mengawal sewa dan penggunaan kenderaan yang disediakan oleh <strong>VIQ MOTOR EMPIRE</strong> (&ldquo;Pemilik&rdquo;, &ldquo;kami&rdquo;, atau &ldquo;kita&rdquo;) kepada individu yang menyewa kenderaan tersebut (&ldquo;Penyewa&rdquo;, &ldquo;anda&rdquo;, atau &ldquo;anda&rdquo;).</p>
        <p>Dengan membuat tempahan, membuat pembayaran, menerima serahan kenderaan, atau menandatangani Perjanjian Sewa Kenderaan, anda mengesahkan bahawa anda telah membaca, memahami dan bersetuju dengan Terma ini.</p>

        <h2>1. Tempahan &amp; Perjanjian Sewaan</h2>
        <p>1.1 Tempahan sewaan hanya disahkan apabila bayaran tempahan, bayaran sewaan atau deposit yang diperlukan telah diterima dan tempahan telah diterima oleh VIQ MOTOR EMPIRE.</p>
        <p>1.2 Pemilik berhak menolak atau membatalkan sewaan jika Penyewa tidak memenuhi kelayakan, dokumen, pembayaran, insurans atau keperluan penggunaan kenderaan yang diperlukan.</p>
        <p>1.3 Penyewa mesti memberikan maklumat yang tepat dan lengkap semasa membuat tempahan.</p>
        <p>1.4 Orang yang dinamakan dalam perjanjian sewaan adalah Penyewa dan bertanggungjawab mematuhi Terma ini sepanjang tempoh sewaan.</p>
        <p>1.5 Terma ini, bersama-sama dengan butiran tempahan yang berkenaan dan Perjanjian Sewa Kenderaan, membentuk perjanjian antara Pemilik dan Penyewa.</p>

        <h2>2. Kelayakan &amp; Dokumen Penyewa</h2>
        <p>Sebelum penyerahan kenderaan, Penyewa mungkin perlu menyediakan:</p>
        <ul>
            <li>IC Malaysia yang sah atau pasport yang sah;</li>
            <li>lesen memandu yang sah;</li>
            <li>maklumat hubungan yang sah;</li>
            <li>bukti alamat atau pengenalan lain yang diperlukan;</li>
            <li>dokumen lain yang wajarlah diperlukan oleh Pemilik atau syarat insurans yang berkenaan.</li>
        </ul>
        <p>Penyewa mesti dibenarkan secara sah untuk memandu kenderaan yang disewa di Malaysia.</p>
        <p>Pemilik boleh menolak penyerahan kenderaan jika Penyewa tidak dapat memberikan dokumen yang memuaskan atau tidak memenuhi syarat sewaan yang berkenaan.</p>

        <h2>3. Keadaan Kenderaan &amp; Pemeriksaan</h2>
        <p>3.1 Kenderaan akan disediakan dalam keadaan jalan yang baik dan, setakat yang berkenaan, mematuhi keperluan jalan Malaysia.</p>
        <p>3.2 Sebelum penyerahan, Pemilik boleh menjalankan pemeriksaan foto dan/atau video kenderaan.</p>
        <p>3.3 Pemeriksaan boleh merekodkan:</p>
        <ul>
            <li>Keadaan badan luar;</li>
            <li>Keadaan dalaman;</li>
            <li>Roda dan tayar;</li>
            <li>Cermin hadapan dan tingkap;</li>
            <li>Calar, penyok atau kerosakan sedia ada;</li>
            <li>Odometer;</li>
            <li>Aksesori dan peralatan kenderaan.</li>
        </ul>
        <p>3.4 Rekod pemeriksaan boleh digunakan sebagai bukti keadaan kenderaan pada permulaan sewaan.</p>
        <p>3.5 Penyewa harus memeriksa kenderaan sebelum menerimanya dan mesti memberitahu Pemilik dengan serta-merta mengenai sebarang keadaan atau kerosakan yang belum direkodkan.</p>
        <p>3.6 Dengan menerima kenderaan, Penyewa mengakui bahawa kenderaan itu telah diperiksa dan diterima dalam keadaan yang direkodkan.</p>

        <h2>4. Tempoh Sewaan</h2>
        <p>4.1 Sewaan bermula pada tarikh dan masa pengambilan/penyerahan yang dipersetujui dan tamat pada tarikh dan masa pulangan yang dipersetujui.</p>
        <p>4.2 Kenderaan mesti dipulangkan ke lokasi yang dipersetujui mengikut masa pulangan yang dipersetujui melainkan lanjutan telah diluluskan oleh Pemilik.</p>
        <p>4.3 Lanjutan sewaan tertakluk kepada ketersediaan kenderaan dan kelulusan Pemilik.</p>
        <p>4.4 Lanjutan hanya sah setelah disahkan oleh Pemilik.</p>
        <p>4.5 Penyewa tidak boleh menganggap bahawa lanjutan telah diluluskan semata-mata kerana permintaan telah dikemukakan.</p>

        <h2>5. Bayaran Sewaan &amp; Pembayaran</h2>
        <p>5.1 Kadar sewaan yang berkenaan akan disahkan pada masa tempahan.</p>
        <p>5.2 Melainkan dipersetujui secara bertulis, semua caj sewaan mesti dibayar sebelum penyerahan kenderaan.</p>
        <p>5.3 Caj tambahan mungkin dikenakan untuk:</p>
        <ul>
            <li>Lanjutan sewaan;</li>
            <li>Pulangan lewat;</li>
            <li>Penghantaran atau pengambilan;</li>
            <li>Pembersihan;</li>
            <li>Kesalahan trafik;</li>
            <li>Caj tempat letak kereta;</li>
            <li>Tol;</li>
            <li>Kerosakan;</li>
            <li>Penarikan atau towing;</li>
            <li>Kos berkaitan insurans;</li>
            <li>Penggunaan tanpa kebenaran;</li>
            <li>Caj lain yang timbul daripada pelanggaran Penyewa terhadap Terma ini.</li>
        </ul>
        <p>5.4 Bayaran sewaan biasanya tidak boleh dikembalikan setelah tempoh sewaan bermula, kecuali jika dipersetujui lain oleh Pemilik atau diperlukan oleh undang-undang yang berkenaan.</p>

        <h2>6. Deposit Keselamatan</h2>
        <p>6.1 Deposit keselamatan mungkin diperlukan sebelum penyerahan kenderaan.</p>
        <p>6.2 Jumlah deposit akan diberitahu kepada Penyewa sebelum sewaan bermula.</p>
        <p>6.3 Tertakluk kepada pemeriksaan dan pengesahan, deposit biasanya akan diproses untuk bayaran balik dalam masa <strong>24 jam selepas kenderaan dipulangkan</strong>.</p>
        <p>6.4 Bayaran balik mungkin ditangguhkan jika pengesahan tambahan diperlukan secara munasabah, termasuk pengesahan:</p>
        <ul>
            <li>Kerosakan kenderaan;</li>
            <li>Saman trafik;</li>
            <li>Kesalahan tempat letak kereta;</li>
            <li>Caj tol;</li>
            <li>Keperluan pembersihan;</li>
            <li>Caj sewaan tertunggak;</li>
            <li>Tuntutan insurans;</li>
            <li>Tuntutan pihak ketiga;</li>
            <li>Jumlah lain yang perlu dibayar oleh Penyewa.</li>
        </ul>
        <p>6.5 Jika Penyewa berhutang kepada Pemilik, Pemilik boleh menggunakan deposit keselamatan untuk jumlah tersebut setakat dibenarkan oleh undang-undang yang berkenaan.</p>

        <h2>7. Pemandu Sah</h2>
        <p>7.1 Hanya Penyewa dan mana-mana pemandu tambahan yang diluluskan secara jelas oleh VIQ MOTOR EMPIRE mungkin memandu kenderaan.</p>
        <p>7.2 Penyewa tidak boleh membenarkan orang yang tidak dibenarkan memandu kenderaan.</p>
        <p>7.3 Penyewa tetap bertanggungjawab memastikan mana-mana pemandu tambahan yang diluluskan mematuhi Terma ini.</p>
        <p>7.4 Pemilik mungkin memerlukan pengenalan dan lesen memandu yang sah daripada setiap pemandu yang diluluskan.</p>
        <p>7.5 Membenarkan pemandu yang tidak dibenarkan memandu kenderaan boleh mengakibatkan penamatan sewaan dan caj tambahan atau liabiliti setakat dibenarkan oleh undang-undang dan syarat insurans yang berkenaan.</p>

        <h2>8. Penggunaan yang Dilarang</h2>
        <p>Kenderaan tidak boleh digunakan:</p>
        <ol>
            <li>Untuk aktiviti haram.</li>
            <li>Untuk lumba, ujian kelajuan, pertandingan atau aktiviti pemanduan berbahaya lain.</li>
            <li>Untuk memandu di bawah pengaruh alkohol, dadah atau sebarang bahan yang boleh menjejaskan kemampuan memandu.</li>
            <li>Untuk mengangkut barangan haram, berbahaya atau dilarang.</li>
            <li>Untuk sub-sewaan, penjualan semula atau pinjaman kepada orang lain tanpa kelulusan bertulis.</li>
            <li>Untuk Grab, e-hailing, penghantaran makanan, kurier atau tujuan komersial melainkan diberi kuasa secara jelas oleh VIQ MOTOR EMPIRE dan dibenarkan di bawah susunan kenderaan dan insurans yang berkenaan.</li>
            <li>Di luar Malaysia tanpa kebenaran bertulis terdahulu.</li>
            <li>Dengan cara yang melanggar undang-undang Malaysia, peraturan lalu lintas, syarat insurans atau spesifikasi keselamatan pengilang.</li>
            <li>Dengan cara yang boleh merosakkan, membebankan atau menjejaskan umur kenderaan secara berlebihan.</li>
            <li>Dengan odometer, penjejak GPS, peralatan keselamatan atau sistem kenderaan lain dirosakkan, diputuskan atau diubah suai.</li>
        </ol>

        <h2>9. Perjalanan Merentasi Sempadan</h2>
        <p>9.1 Kenderaan mesti kekal di Malaysia melainkan Pemilik telah memberikan kelulusan bertulis terdahulu.</p>
        <p>9.2 Membawa kenderaan keluar dari Malaysia tanpa kebenaran merupakan pelanggaran serius terhadap perjanjian sewaan.</p>
        <p>9.3 Penyewa mungkin bertanggungjawab untuk semua kos, kerugian, perbelanjaan pemulihan dan jumlah lain yang boleh dipulihkan secara undang-undang.</p>

        <h2>10. Kemalangan, Kerosakan &amp; Kerosakan</h2>
        <p>Jika berlaku kemalangan, kerosakan, kecurian, cubaan kecurian, kerosakan atau kejadian besar lain, Penyewa mesti:</p>
        <ol>
            <li>Hubungi VIQ MOTOR EMPIRE dengan segera;</li>
            <li>Hubungi perkhidmatan kecemasan yang berkenaan jika perlu;</li>
            <li>Ikut arahan munasabah yang diberikan oleh Pemilik;</li>
            <li>Elakkan mengakui tanggungjawab atau membuat penyelesaian tanpa kebenaran dengan pihak ketiga;</li>
            <li>Dapatkan maklumat berkaitan daripada pihak lain yang terlibat;</li>
            <li>Ambil gambar dan/atau video kejadian serta keadaan sekeliling jika selamat dilakukan;</li>
            <li>Buat laporan polis jika diperlukan oleh undang-undang, keperluan insurans atau Pemilik;</li>
            <li>Bekerjasama sepenuhnya dengan Pemilik dan insurer yang berkenaan.</li>
        </ol>
        <p><strong>Hubungi Kecemasan / Insiden:</strong></p>
        <p>+60198434513<br>+60193404180<br>+60147143193</p>
        <p>Kegagalan untuk memberitahu Pemilik dengan segera boleh menjejaskan pengendalian tuntutan insurans dan boleh meningkatkan liabiliti Penyewa jika dibenarkan oleh undang-undang yang berkenaan dan polisi insurans yang berkaitan.</p>

        <h2>11. Tanggungjawab Kerosakan &amp; Penyewa</h2>
        <p>11.1 Penyewa bertanggungjawab ke atas kerosakan, kehilangan atau kemerosotan yang disebabkan oleh pelanggaran Terma ini oleh Penyewa, kecuaian, penyalahgunaan, penggunaan tanpa kebenaran atau keadaan lain di mana Penyewa bertanggungjawab secara sah.</p>
        <p>11.2 Jika Penyewa bertanggungjawab, Pemilik boleh menuntut semula kos munasabah dan boleh dipulihkan secara undang-undang yang berkaitan dengan kerosakan atau kehilangan, termasuk:</p>
        <ul>
            <li>kos pembaikan;</li>
            <li>kos penggantian;</li>
            <li>towing dan pemulihan;</li>
            <li>caj bengkel;</li>
            <li>caj penilaian;</li>
            <li>kos pentadbiran;</li>
            <li>kelebihan insurans atau kos insurans lain yang berkenaan;</li>
            <li>kerugian sewaan yang munasabah yang secara langsung disebabkan kerosakan, jika boleh dipulihkan secara sah.</li>
        </ul>
        <p>11.3 Liabiliti Penyewa tidak terhad secara automatik kepada deposit keselamatan.</p>
        <p>11.4 Sebarang tuntutan kerosakan akan dinilai berdasarkan bukti yang ada, termasuk foto/video pemeriksaan, sebut harga bengkel atau invois, laporan polis, dokumentasi insurans dan bukti lain yang berkaitan.</p>

        <h2>12. Downtime / Kehilangan Penggunaan</h2>
        <p>12.1 Jika kenderaan tidak tersedia untuk disewa kerana kerosakan di mana Penyewa bertanggungjawab secara sah, Pemilik boleh meminta pampasan munasabah untuk kerugian penggunaan sewaan yang terhasil secara langsung, tertakluk kepada undang-undang yang berkenaan dan keadaan kejadian.</p>
        <p>12.2 Jika berkenaan, caj downtime yang dipersetujui ialah:</p>
        <p><strong>RM100 sehari</strong></p>
        <p>12.3 Sebarang caj sedemikian akan dikira berdasarkan tempoh sebenar kenderaan tidak dapat digunakan secara munasabah untuk sewaan dan keadaan yang berkenaan.</p>

        <h2>13. Denda Trafik, Saman, Tempat Letak Kereta &amp; Tol</h2>
        <p>Penyewa bertanggungjawab ke atas semua caj yang ditanggung semasa tempoh sewaan yang berpunca daripada penggunaan kenderaan oleh Penyewa, termasuk:</p>
        <ul>
            <li>Saman trafik;</li>
            <li>Denda tempat letak kereta;</li>
            <li>Tol;</li>
            <li>Notis kompaun;</li>
            <li>Caj pengguna jalan;</li>
            <li>Caj undang-undang lain yang dikaitkan dengan penggunaan kenderaan oleh Penyewa.</li>
        </ul>
        <p>Caj pemprosesan pentadbiran:</p>
        <p><strong>RM50 setiap kesalahan</strong></p>
        <p>mungkin dikenakan jika Pemilik perlu memproses, mengenal pasti, bertindak balas atau mentadbir caj tersebut.</p>
        <p>Pemilik boleh menolak jumlah yang berkenaan daripada deposit keselamatan jika dibenarkan.</p>

        <h2>14. Sistem Jejak &amp; Keselamatan Kenderaan</h2>
        <p>14.1 Penyewa mengakui bahawa kenderaan mungkin dilengkapi dengan pengesanan GPS, telematik, sistem keselamatan atau teknologi pemantauan kenderaan lain.</p>
        <p>14.2 Sistem sedemikian boleh digunakan untuk tujuan yang sah termasuk:</p>
        <ul>
            <li>Keselamatan kenderaan;</li>
            <li>pencegahan dan pemulihan kecurian;</li>
            <li>pengurusan armada;</li>
            <li>pentadbiran sewaan;</li>
            <li>pengesahan lokasi kenderaan;</li>
            <li>penyiasatan kejadian;</li>
            <li>perlindungan harta Pemilik.</li>
        </ul>
        <p>14.3 Penyewa tidak boleh membuang, memutuskan sambungan, melumpuhkan, merosakkan, mengganggu atau mengusik sebarang peralatan pengesanan atau keselamatan.</p>
        <p>14.4 Maklumat yang dikumpulkan melalui sistem kenderaan boleh didedahkan bila perlu secara munasabah untuk pemulihan kenderaan, tuntutan insurans, prosiding undang-undang, permintaan pihak berkuasa undang-undang atau tujuan sah lain.</p>

        <h2>15. Kegagalan Mengembalikan Kenderaan</h2>
        <p>15.1 Kenderaan mesti dipulangkan pada masa dan lokasi yang dipersetujui.</p>
        <p>15.2 Kegagalan untuk mengembalikan kenderaan tanpa lanjutan yang diluluskan boleh menjadi pelanggaran serius terhadap perjanjian sewaan.</p>
        <p>15.3 Jika sesuai, Pemilik boleh:</p>
        <ul>
            <li>menghubungi Penyewa;</li>
            <li>meminta pemulangan kenderaan segera;</li>
            <li>mengatur pemulihan kenderaan;</li>
            <li>menghubungi pihak berkuasa yang berkaitan;</li>
            <li>membuat laporan polis;</li>
            <li>memulakan prosiding sivil atau undang-undang lain;</li>
            <li>mencari pemulihan kerugian dan perbelanjaan yang boleh dipulihkan secara sah.</li>
        </ul>
        <p>15.4 Rekod GPS, foto, video, mesej, rekod bayaran, dokumen sewaan dan rekod lain yang relevan boleh disimpan dan digunakan sebagai bukti jika dibenarkan secara sah.</p>

        <h2>16. Penamatan Sewaan</h2>
        <p>Pemilik boleh menamatkan perjanjian sewaan jika wajar, termasuk di mana:</p>
        <ul>
            <li>bayaran sewaan tidak dibuat;</li>
            <li>kenderaan digunakan melanggar Terma ini;</li>
            <li>pemandu yang tidak dibenarkan mengendalikan kenderaan;</li>
            <li>kenderaan digunakan untuk tujuan haram atau dilarang;</li>
            <li>kenderaan dibawa keluar dari Malaysia tanpa kebenaran;</li>
            <li>Penyewa memberikan maklumat yang sangat palsu;</li>
            <li>kenderaan ditinggalkan;</li>
            <li>syarat insurans dilanggar;</li>
            <li>Penyewa gagal mengembalikan kenderaan;</li>
            <li>Pemilik berpendapat munasabah bahawa kenderaan berisiko hilang, rosak atau disalahgunakan.</li>
        </ul>
        <p>Jika sewaan ditamatkan kerana pelanggaran Penyewa, Penyewa mungkin tetap bertanggungjawab untuk caj tertunggak yang berkenaan, kerosakan dan kos lain yang boleh dipulihkan secara sah.</p>

        <h2>17. Pembatalan &amp; Bayaran Balik</h2>
        <p>17.1 Syarat pembatalan dan bayaran balik bergantung pada terma tempahan yang diberitahu kepada Penyewa pada masa tempahan.</p>
        <p>17.2 Setelah tempoh sewaan bermula, bayaran sewaan secara amnya tidak boleh dikembalikan.</p>
        <p>17.3 Jika Pemilik membatalkan tempahan sebelum penyerahan atas sebab yang berada dalam kawalan Pemilik, Pemilik akan memberitahu bayaran balik atau susunan alternatif yang berkenaan.</p>
        <p>17.4 Tiada dalam Terma ini mengecualikan atau mengehadkan sebarang hak yang tidak boleh dikecualikan atau dihadkan secara sah di bawah undang-undang Malaysia.</p>

        <h2 id="personal-information-documents">18. Maklumat Peribadi &amp; Dokumen</h2>
        <p>18.1 Pemilik boleh mengumpul maklumat peribadi yang diperlukan secara munasabah untuk memproses dan mentadbir sewaan kenderaan.</p>
        <p>18.2 Ini mungkin termasuk:</p>
        <ul>
            <li>Nama;</li>
            <li>maklumat IC atau pasport;</li>
            <li>maklumat lesen memandu;</li>
            <li>butiran hubungan;</li>
            <li>alamat;</li>
            <li>maklumat tempahan;</li>
            <li>maklumat pembayaran;</li>
            <li>rekod penyerahan/pulangan kenderaan;</li>
            <li>foto dan video;</li>
            <li>maklumat berkaitan kemalangan, kerosakan atau kesalahan trafik.</li>
        </ul>
        <p>18.3 Maklumat peribadi akan dikendalikan mengikut keperluan privasi dan perlindungan data Malaysia yang berkenaan.</p>
        <p>18.4 Maklumat boleh dikongsi bila perlu secara munasabah dengan insurer, bengkel, pembekal pemulihan kenderaan, pembekal pembayaran, pihak berkuasa undang-undang, penasihat undang-undang atau pihak lain yang berkaitan untuk tujuan sewaan, keselamatan, insurans atau undang-undang yang sah.</p>

        <h2>19. Foto, Video &amp; Bukti</h2>
        <p>Penyewa mengakui bahawa foto dan/atau video mungkin diambil semasa:</p>
        <ul>
            <li>penyerahan kenderaan;</li>
            <li>pulangan kenderaan;</li>
            <li>pemeriksaan kenderaan;</li>
            <li>penilaian kerosakan;</li>
            <li>penyiasatan kemalangan.</li>
        </ul>
        <p>Rekod sedemikian boleh digunakan untuk menentukan keadaan kenderaan dan boleh disimpan untuk pentadbiran sewaan, insurans, penyelesaian pertikaian atau tujuan undang-undang, tertakluk kepada undang-undang yang berkenaan.</p>

        <h2>20. Ketersediaan &amp; Penggantian Kenderaan</h2>
        <p>20.1 Ketersediaan kenderaan tertakluk kepada tempahan terdahulu, penyelenggaraan, pembaikan, kemalangan dan keadaan lain.</p>
        <p>20.2 Jika kenderaan yang ditempah tidak tersedia sebelum penyerahan kerana keadaan di luar kawalan munasabah Pemilik, Pemilik boleh menawarkan kenderaan gantian atau susunan lain di mana munasabah mungkin.</p>
        <p>20.3 Sebarang perbezaan harga sewaan akan diberitahu kepada Penyewa sebelum penerimaan kenderaan gantian.</p>

        <h2>21. Masalah Kerosakan &amp; Mekanikal</h2>
        <p>21.1 Jika masalah mekanikal berlaku, Penyewa mesti menghubungi VIQ MOTOR EMPIRE secepat mungkin.</p>
        <p>21.2 Penyewa tidak boleh membenarkan pembaikan besar tanpa kelulusan Pemilik melainkan tindakan segera diperlukan untuk keselamatan.</p>
        <p>21.3 Pemilik boleh mengatur bantuan tepi jalan, pemeriksaan, pembaikan atau pemulihan kenderaan di mana sesuai.</p>
        <p>21.4 Penyewa tidak boleh cuba membaiki atau mengubah suai kenderaan tanpa kebenaran.</p>

        <h2>22. Tanggungjawab Penjagaan Penyewa</h2>
        <p>Penyewa mesti menjaga kenderaan dengan teliti sepanjang tempoh sewaan.</p>
        <p>Penyewa perlu:</p>
        <ul>
            <li>Mengunci kenderaan apabila ditinggalkan;</li>
            <li>Menjaga kunci dengan selamat;</li>
            <li>Parkir di lokasi yang selamat secara munasabah;</li>
            <li>Mengikuti undang-undang lalu lintas Malaysia;</li>
            <li>Mengawasi lampu amaran dan keadaan kenderaan;</li>
            <li>Berhenti memandu jika memandu berterusan boleh menimbulkan risiko keselamatan;</li>
            <li>Menghubungi Pemilik dengan segera apabila berlaku masalah penting.</li>
        </ul>
        <p>Kehilangan kunci, dokumen kenderaan atau aksesori boleh mengakibatkan caj tambahan jika berkenaan.</p>

        <h2>23. Hak Pemilik</h2>
        <p>Pemilik berhak untuk:</p>
        <ul>
            <li>Mengesahkan identiti dan dokumen penyewa;</li>
            <li>Menolak sewaan jika syarat kelayakan tidak dipenuhi;</li>
            <li>Memerlukan bayaran caj yang berkenaan;</li>
            <li>Memeriksa kenderaan;</li>
            <li>Memulihkan kenderaan jika perjanjian sewaan telah dilanggar;</li>
            <li>Menghubungi pihak berkuasa yang berkaitan jika sesuai;</li>
            <li>mengambil langkah munasabah untuk melindungi kenderaan dan memulihkan jumlah yang sewajarnya tertunggak.</li>
        </ul>
        <p>Pemilik akan melaksanakan hak ini tertakluk kepada undang-undang Malaysia yang berkenaan.</p>

        <h2>24. Had Liabiliti</h2>
        <p>Setakat dibenarkan oleh undang-undang Malaysia, Pemilik tidak akan bertanggungjawab terhadap kerugian tidak langsung atau berbangkit daripada keadaan di luar kawalan munasabah Pemilik.</p>
        <p>Tiada dalam Terma ini mengecualikan atau mengehadkan liabiliti yang tidak boleh dikecualikan atau dihadkan secara sah di bawah undang-undang Malaysia.</p>

        <h2>25. Force Majeure</h2>
        <p>Pemilik tidak akan bertanggungjawab atas kegagalan atau kelewatan melaksanakan kewajipan yang disebabkan oleh keadaan yang berada di luar kawalan munasabah Pemilik, termasuk bencana alam, cuaca buruk, tindakan kerajaan, penutupan jalan, kemalangan besar, kecemasan awam, mogok atau peristiwa luar biasa lain.</p>

        <h2>26. Undang-undang yang Mengawal</h2>
        <p>Terma ini dan sebarang perjanjian sewaan antara Pemilik dan Penyewa dikawal oleh undang-undang Malaysia.</p>
        <p>Mana-mana pertikaian akan ditangani mengikut undang-undang dan bidang kuasa Malaysia yang berkenaan.</p>

        <h2>27. Kebolehpisahan</h2>
        <p>Jika mana-mana peruntukan Terma ini didapati tidak sah, menyalahi undang-undang atau tidak boleh dikuatkuasakan, peruntukan itu akan diubah suai atau dipisahkan setakat yang perlu, dan baki peruntukan akan terus terpakai setakat dibenarkan oleh undang-undang.</p>

        <h2>28. Perjanjian Penuh</h2>
        <p>Perjanjian Sewa Kenderaan, pengesahan tempahan, caj sewaan yang berkenaan dan Terma ini membentuk perjanjian antara Pemilik dan Penyewa mengenai sewaan kenderaan.</p>
        <p>Sebarang pindaan atau susunan khas hendaklah disahkan secara bertulis oleh Pemilik.</p>

        <h2>29. Pengakuan &amp; Penerimaan</h2>
        <p>Dengan menandatangani Perjanjian Sewa Kenderaan, membuat pembayaran, menerima kenderaan, atau meneruskan sewaan, Penyewa mengesahkan bahawa:</p>
        <ul>
            <li>Saya telah membaca dan memahami Terma &amp; Syarat Sewa Kenderaan ini.</li>
            <li>Saya bersetuju untuk mematuhi semua peraturan sewaan yang berkenaan.</li>
            <li>Saya mengesahkan bahawa maklumat dan dokumen yang saya berikan adalah tepat.</li>
            <li>Saya mengesahkan bahawa saya dibenarkan secara sah untuk memandu kenderaan.</li>
            <li>Saya menerima tanggungjawab terhadap kenderaan semasa tempoh sewaan setakat yang ditetapkan oleh perjanjian sewaan dan undang-undang yang berkenaan.</li>
            <li>Saya mengakui bahawa foto dan/atau video kenderaan mungkin diambil sebelum dan selepas sewaan.</li>
            <li>Saya mengakui bahawa kenderaan mungkin mengandungi peralatan penjejakan GPS atau keselamatan.</li>
            <li>Saya bersetuju untuk segera memberitahu VIQ MOTOR EMPIRE tentang sebarang kemalangan, kerosakan, kecurian, kerosakan atau kejadian besar lain.</li>
            <li>Saya bersetuju untuk mengembalikan kenderaan pada tarikh, masa dan lokasi yang dipersetujui.</li>
            <li>Saya bersetuju untuk membayar caj sewaan yang berkenaan dan caj lain yang boleh dipulihkan secara sah yang timbul daripada penggunaan kenderaan saya atau pelanggaran perjanjian sewaan.</li>
        </ul>
    `,
    zh: `
        <p class="legal-kicker">车辆租赁条款与条件</p>
        <h1>VIQ MOTOR EMPIRE</h1>
        <div class="legal-meta">
            <p><strong>注册号:</strong> 202603097176 (IP0623975-W)</p>
            <p><strong>所有者:</strong> NGOI YE SHENG</p>
            <p><strong>营业地址:</strong> Jalan Teknokrat 1, Cyberjaya, 63000 Cyberjaya, Selangor, Malaysia</p>
            <p><strong>电话:</strong> +60198434513 / +60193404180 / +60147143193</p>
            <p><strong>电子邮件:</strong> <a href="mailto:motoviq@gmail.com">motoviq@gmail.com</a></p>
            <p><strong>生效日期:</strong> [插入日期]</p>
        </div>

        <p>这些车辆租赁条款与条件（&ldquo;条款&rdquo;）规范 VIQ MOTOR EMPIRE（&ldquo;所有者&rdquo;、&ldquo;我们&rdquo; 或 &ldquo;我方&rdquo;）向租赁车辆的个人（&ldquo;承租人&rdquo;、&ldquo;您&rdquo; 或 &ldquo;您的&rdquo;）提供的车辆租赁和使用。</p>
        <p>通过预订、付款、接受交付车辆或签署车辆租赁协议，您确认您已阅读、理解并同意这些条款。</p>

        <h2>1. 预订与租赁协议</h2>
        <p>1.1 仅当已收到所需的预订款、租金或押金，并且 VIQ MOTOR EMPIRE 已接受该预订时，租赁预订才会确认。</p>
        <p>1.2 若承租人未满足所需的资格、文件、付款、保险或车辆使用要求，所有者保留拒绝或取消租赁的权利。</p>
        <p>1.3 承租人在预订时必须提供准确完整的信息。</p>
        <p>1.4 租赁协议中列明的人为承租人，负责在整个租赁期间遵守这些条款。</p>
        <p>1.5 这些条款、相关预订细节以及车辆租赁协议共同构成所有者与承租人之间的协议。</p>

        <h2>2. 承租人资格与文件</h2>
        <p>在交付车辆前，承租人可能需要提供：</p>
        <ul>
            <li>有效的马来西亚身份证或有效护照；</li>
            <li>有效驾驶执照；</li>
            <li>有效联系方式；</li>
            <li>地址证明或其他合理要求的身份证明；</li>
            <li>所有者或适用保险要求所合理要求的其他文件。</li>
        </ul>
        <p>承租人必须依法有资格在马来西亚驾驶租赁车辆。</p>
        <p>如果承租人无法提供令人满意的文件或不符合适用租赁要求，所有者可以拒绝交付车辆。</p>

        <h2>3. 车辆状况与检查</h2>
        <p>3.1 车辆将按道路适用状态提供，并在适用范围内符合马来西亚道路要求。</p>
        <p>3.2 在交付前，所有者可对车辆进行照相和/或视频检查。</p>
        <p>3.3 检查可能记录：</p>
        <ul>
            <li>车辆外观状况；</li>
            <li>内部状况；</li>
            <li>轮胎和车轮；</li>
            <li>挡风玻璃和车窗；</li>
            <li>现有划痕、凹痕或损坏；</li>
            <li>里程；</li>
            <li>车辆配件和设备。</li>
        </ul>
        <p>3.4 检查记录可作为租赁开始时车辆状况的证据。</p>
        <p>3.5 承租人应在接受车辆前进行检查，并必须立即通知所有者任何未记录的状况或损坏。</p>
        <p>3.6 接受车辆后，承租人确认该车辆已按记录状态接受并检查。</p>

        <h2>4. 租期</h2>
        <p>4.1 租赁在约定的取车/交付日期和时间开始，并在约定的归还日期和时间结束。</p>
        <p>4.2 除非所有者已批准延长，否则车辆必须在约定的还车时间前返回至约定地点。</p>
        <p>4.3 租期延长须视车辆可用性和所有者批准情况而定。</p>
        <p>4.4 仅在所有者确认后，延长才生效。</p>
        <p>4.5 承租人不得仅因为提交了延长请求就假定延长已批准。</p>

        <h2>5. 租金与付款</h2>
        <p>5.1 适用租赁费将在预订时确认。</p>
        <p>5.2 除非另有书面约定，否则所有租赁费用必须在交付车辆前支付。</p>
        <p>5.3 额外费用可能适用于：</p>
        <ul>
            <li>租期延长；</li>
            <li>逾期归还；</li>
            <li>送货/取车；</li>
            <li>清洁；</li>
            <li>交通违法；</li>
            <li>停车费用；</li>
            <li>过路费；</li>
            <li>损坏；</li>
            <li>拖车或救援；</li>
            <li>保险相关费用；</li>
            <li>未经授权使用；</li>
            <li>其他因承租人违反这些条款而产生的费用。</li>
        </ul>
        <p>5.4 一旦租赁期开始，租金一般不可退还，除非所有者另有同意或适用法律另有规定。</p>

        <h2>6. 保证金</h2>
        <p>6.1 交付车辆前可能需要押金。</p>
        <p>6.2 押金金额将在租赁开始前通知承租人。</p>
        <p>6.3 经检查和核实后，押金通常会在 <strong>车辆归还后 24 小时内</strong> 处理退款。</p>
        <p>6.4 在需要额外核实时，退款可能会延迟，包括核实：</p>
        <ul>
            <li>车辆损坏；</li>
            <li>交通罚单；</li>
            <li>停车罚单；</li>
            <li>过路费；</li>
            <li>清洁要求；</li>
            <li>未结租金；</li>
            <li>保险索赔；</li>
            <li>第三方索赔；</li>
            <li>承租人应付的其他金额。</li>
        </ul>
        <p>6.5 若承租人欠所有者款项，所有者可在适用法律许可范围内将押金用于抵扣该金额。</p>

        <h2>7. 经授权驾驶员</h2>
        <p>7.1 只有承租人及由 VIQ MOTOR EMPIRE 明确批准的额外驾驶员才能驾驶车辆。</p>
        <p>7.2 承租人不得允许未经授权的人驾驶此车辆。</p>
        <p>7.3 承租人仍负责确保任何经批准的额外驾驶员遵守这些条款。</p>
        <p>7.4 所有者可要求每位经批准驾驶员提供身份证明和有效驾驶执照。</p>
        <p>7.5 允许无授权驾驶员驾驶车辆，可能导致租赁终止，并在法律及适用保险条款允许的范围内收取额外费用或承担责任。</p>

        <h2>8. 禁止使用</h2>
        <p>车辆不得用于：</p>
        <ol>
            <li>任何非法活动；</li>
            <li>赛车、测速比赛、竞争或其他危险驾驶活动；</li>
            <li>酒后驾车、药物或任何可能影响驾驶能力的物质；</li>
            <li>运输非法、危险或禁止的货物；</li>
            <li>未获书面批准的转租、转售或借给他人；</li>
            <li>Grab、电子叫车、送餐、快递或商业用途，除非 VIQ MOTOR EMPIRE 明确授权并符合适用车辆和保险安排；</li>
            <li>未经事先书面许可离开马来西亚；</li>
            <li>任何违反马来西亚法律、交通法规、保险要求或制造商安全要求的方式；</li>
            <li>任何可能损坏、超载或过度磨损车辆的方式；</li>
            <li>擅自篡改、断开或更改里程表、GPS 追踪器、安全设备或其他车辆系统。</li>
        </ol>

        <h2>9. 跨境旅行</h2>
        <p>9.1 车辆必须留在马来西亚，除非所有者事先已出具书面批准。</p>
        <p>9.2 未获许可将车辆带出马来西亚构成严重违约。</p>
        <p>9.3 承租人可能需承担所有因此产生的费用、损失、追讨支出以及其他可依法追偿的金额。</p>

        <h2>10. 事故、损坏与故障</h2>
        <p>若发生事故、损坏、盗窃、企图盗窃、故障或其他重大事件，承租人必须：</p>
        <ol>
            <li>立即联系 VIQ MOTOR EMPIRE；</li>
            <li>在必要时联系相关紧急服务；</li>
            <li>遵循所有者提供的合理指示；</li>
            <li>避免承认责任或与第三方作出未经授权的和解；</li>
            <li>获取其他相关方的信息；</li>
            <li>在安全的情况下拍摄事故及周边情况的照片和/或视频；</li>
            <li>按法律、保险要求或所有者要求提交警方报告；</li>
            <li>与所有者和相关保险公司充分合作。</li>
        </ol>
        <p><strong>紧急 / 事故联络:</strong></p>
        <p>+60198434513<br>+60193404180<br>+60147143193</p>
        <p>未能及时通知所有者，可能影响保险索赔处理，并可能增加承租人在适用法律和相关保险政策允许下的责任。</p>

        <h2>11. 损害与承租人责任</h2>
        <p>11.1 承租人对因其违反这些条款、疏忽、误用、未经授权使用或其他其依法应负责的情况造成的损害、损失或恶化承担责任。</p>
        <p>11.2 若承租人承担责任，所有者可向其追回合理且可依法追偿的相关成本，包括修理费、替换费、拖车及救援、维修店费用、评估费用、行政费用、保险免赔额或其他适用费用，以及因损坏直接造成的合理租赁收入损失（如可依法追偿）。</p>
        <p>11.3 承租人的责任并不自动仅限于押金。</p>
        <p>11.4 任何损坏索赔均将根据现有证据评估，包括检查照片/视频、维修店报价或发票、警方报告、保险文件及其他相关证据。</p>

        <h2>12. 停机 / 使用损失</h2>
        <p>12.1 若车辆因承租人依法应负责的损坏导致无法用于租赁，所有者可就直接造成的租赁使用损失要求合理赔偿，且须遵守适用法律与事件情况。</p>
        <p>12.2 在适用时，约定停机费用为：</p>
        <p><strong>RM100 每天</strong></p>
        <p>12.3 该费用将根据车辆合理无法用于租赁的实际时间及相关情况计算。</p>

        <h2>13. 交通罚单、传票、停车及过路费</h2>
        <p>承租人在租赁期间因其使用车辆而产生的所有费用，均由承租人负责，包括交通罚单、停车罚款、过路费、违章通知、道路使用费及其他依法征收且归因于承租人使用车辆的费用。</p>
        <p>行政处理费用：</p>
        <p><strong>RM50 每宗</strong></p>
        <p>在所有者需要处理、识别、回应或管理此类费用时，可能适用。</p>
        <p>所有者可在允许的情况下从押金中扣除适用金额。</p>

        <h2>14. 车辆追踪与安全系统</h2>
        <p>14.1 承租人确认，车辆可能配备 GPS 跟踪、遥测、安全系统或其他车辆监控技术。</p>
        <p>14.2 此类系统可用于合法目的，包括车辆安全、防盗和追回、防盗、车队管理、租赁管理、核实车辆位置、事故调查及保护所有者财产。</p>
        <p>14.3 承租人不得移除、断开、禁用、损坏、干扰或篡改任何追踪或安全设备。</p>
        <p>14.4 通过车辆系统收集的信息，如在车辆回收、保险索赔、法律程序、执法请求或其他合法目的所需时，可被披露。</p>

        <h2>15. 未按时归还车辆</h2>
        <p>15.1 车辆必须在约定时间和地点归还。</p>
        <p>15.2 未经批准延长而未归还车辆，可能构成严重违约。</p>
        <p>15.3 在适当情况下，所有者可：</p>
        <ul>
            <li>联系承租人；</li>
            <li>要求立即归还车辆；</li>
            <li>安排车辆追回；</li>
            <li>联系相关当局；</li>
            <li>提交警方报告；</li>
            <li>启动民事或其他法律程序；</li>
            <li>追讨依法可回收的损失和费用。</li>
        </ul>
        <p>15.4 GPS 记录、照片、视频、消息、付款记录、租赁文件及其他相关记录可在依法允许的情况下保留并用作证据。</p>

        <h2>16. 租约终止</h2>
        <p>在合理合理理由下，所有者可终止租赁协议，包括发生以下情况：</p>
        <ul>
            <li>未付款；</li>
            <li>车辆使用违反这些条款；</li>
            <li>未经授权的驾驶员驾驶车辆；</li>
            <li>车辆用于非法或禁止目的；</li>
            <li>未经许可将车辆带出马来西亚；</li>
            <li>承租人提供重大虚假信息；</li>
            <li>车辆被遗弃；</li>
            <li>保险要求被违反；</li>
            <li>承租人未归还车辆；</li>
            <li>所有者合理相信车辆存在损失、损坏或误用风险。</li>
        </ul>
        <p>若租赁因承租人违约而终止，承租人可能仍需负责适用的未结费用、损坏及其他依法可追偿的成本。</p>

        <h2>17. 取消与退款</h2>
        <p>17.1 取消和退款条件将取决于预订时向承租人告知的预订条款。</p>
        <p>17.2 一旦租赁开始，租金一般不可退款。</p>
        <p>17.3 如果所有者在交付前因其控制范围内的理由取消预订，所有者将告知适用的退款或替代安排。</p>
        <p>17.4 本条款不得排除或限制任何在马来西亚法律下无法合法排除或限制的权利。</p>

        <h2 id="personal-information-documents">18. 个人信息与文件</h2>
        <p>18.1 所有者可收集为处理和管理车辆租赁所合理需要的个人资料。</p>
        <p>18.2 这可能包括：</p>
        <ul>
            <li>姓名；</li>
            <li>身份证或护照资料；</li>
            <li>驾驶执照资料；</li>
            <li>联系资料；</li>
            <li>地址；</li>
            <li>预订资料；</li>
            <li>付款资料；</li>
            <li>车辆交付/归还记录；</li>
            <li>照片和视频；</li>
            <li>关于事故、损坏或交通违法的信息。</li>
        </ul>
        <p>18.3 个人资料将按适用的马来西亚隐私和数据保护要求处理。</p>
        <p>18.4 在合理必要时，资料可能与保险公司、维修店、车辆救援供应商、付款供应商、执法机关、法律顾问或其他相关各方共享，以用于合法的租赁、安全、保险或法律目的。</p>

        <h2>19. 照片、视频与证据</h2>
        <p>承租人确认，在以下情况下可能拍摄照片和/或视频：</p>
        <ul>
            <li>车辆交接；</li>
            <li>车辆归还；</li>
            <li>车辆检查；</li>
            <li>损坏评估；</li>
            <li>事故调查。</li>
        </ul>
        <p>此类记录可用于确定车辆状况，并可能保留用于租赁管理、保险、争议解决或法律目的，受适用法律约束。</p>

        <h2>20. 车辆可用性与替换</h2>
        <p>20.1 车辆可用性受先前预订、维护、维修、事故和其他情况限制。</p>
        <p>20.2 如果预订车辆在交付前因超出所有者合理控制范围的情况变得不可用，所有者可在合理可能时提供替代车辆或其他安排。</p>
        <p>20.3 任何租金差异将在接受替代车辆前告知承租人。</p>

        <h2>21. 故障与机械问题</h2>
        <p>21.1 若出现机械问题，承租人必须尽快联系 VIQ MOTOR EMPIRE。</p>
        <p>21.2 除非立即采取行动对安全至关重要，否则承租人不得在未经所有者事先批准的情况下授权重大修理。</p>
        <p>21.3 所有者可在适当时安排 roadside assistance、检查、修理或车辆拖回。</p>
        <p>21.4 承租人不得擅自尝试修理或修改车辆。</p>

        <h2>22. 承租人的照护义务</h2>
        <p>承租人必须在整个租赁期间对车辆尽合理护理。</p>
        <p>承租人应：</p>
        <ul>
            <li>在车辆无人看管时锁好车门；</li>
            <li>妥善保管车钥；</li>
            <li>将车辆停放在合理安全的位置；</li>
            <li>遵守马来西亚交通法律；</li>
            <li>注意警示灯和车辆状况；</li>
            <li>若继续驾驶可能造成安全风险，应停止驾驶；</li>
            <li>发生重大问题时应及时联系所有者。</li>
        </ul>
        <p>失去钥匙、车辆文件或配件可能导致额外费用，具体视情况而定。</p>

        <h2>23. 所有者权利</h2>
        <p>所有者保留以下权利：</p>
        <ul>
            <li>核实承租人身份和文件；</li>
            <li>在不满足资格要求时拒绝租赁；</li>
            <li>要求支付适用费用；</li>
            <li>检查车辆；</li>
            <li>在租赁协议违约时收回车辆；</li>
            <li>在适当时联系相关机构；</li>
            <li>采取合理措施保护车辆并追讨依法应付金额。</li>
        </ul>
        <p>所有者将在适用的马来西亚法律下行使这些权利。</p>

        <h2>24. 责任限制</h2>
        <p>在马来西亚法律允许范围内，所有者不对超出其合理控制范围的间接或后果性损失负责。</p>
        <p>本条款不得排除或限制任何在马来西亚法律下无法合法排除或限制的责任。</p>

        <h2>25. 不可抗力</h2>
        <p>所有者不对因超出其合理控制范围的情况导致的义务失败或延迟负责，包括自然灾害、恶劣天气、政府行动、道路关闭、重大事故、公共紧急事件、罢工或其他特殊事件。</p>

        <h2>26. 适用法律</h2>
        <p>这些条款及所有者与承租人之间的任何租赁协议受马来西亚法律管辖。</p>
        <p>任何争议将按马来西亚适用法律和司法管辖处理。</p>

        <h2>27. 可分割性</h2>
        <p>若这些条款中的任何条文被认定无效、违法或不可执行，该条文将按必要范围修改或删除，其余条款在法律允许范围内继续有效。</p>

        <h2>28. 完整协议</h2>
        <p>车辆租赁协议、预订确认、适用租金及这些条款共同构成所有者与承租人之间关于车辆租赁的协议。</p>
        <p>任何修订或特殊安排应由所有者以书面形式确认。</p>

        <h2>29. 确认与接受</h2>
        <p>通过签署车辆租赁协议、付款、接受车辆或继续进行租赁，承租人确认：</p>
        <ul>
            <li>我已阅读并理解这些车辆租赁条款与条件。</li>
            <li>我同意遵守所有适用的租赁规则。</li>
            <li>我确认我提供的信息和文件准确无误。</li>
            <li>我确认我依法有资格驾驶该车辆。</li>
            <li>我接受在租赁协议和适用法律规定范围内，对整个租赁期间车辆承担责任。</li>
            <li>我确认在租赁前后，车辆照片和/或视频可能被拍摄。</li>
            <li>我确认车辆可能配备 GPS 追踪或安全设备。</li>
            <li>我同意在发生任何事故、损坏、盗窃、故障或其他重大事件时，立即通知 VIQ MOTOR EMPIRE。</li>
            <li>我同意在约定日期、时间和地点归还车辆。</li>
            <li>我同意支付适用租金及因我使用车辆或违约而产生的其他依法可追偿费用。</li>
        </ul>
    `
};

function translateLegalPage(language) {
    const article = document.querySelector(".legal-content");
    if (!article) {
        return;
    }

    const content = legalPageMarkup[language] || legalPageMarkup.en || article.innerHTML;
    article.innerHTML = content;
    article.classList.add("visible");
}

function translatePage(language) {
    const dictionary = pageTranslations[language] || {};

    document.querySelectorAll("body *:not(.language-menu):not(.language-menu *)").forEach(element => {
        element.childNodes.forEach(node => {
            if (node.nodeType !== Node.TEXT_NODE) {
                return;
            }

            const normalizedText = node.textContent.trim().replace(/\s+/g, " ");
            const original = originalTextNodes.get(node) || normalizedText;
            originalTextNodes.set(node, original);
            node.textContent = node.textContent.replace(node.textContent.trim(), dictionary[original] || original);
        });

        ["placeholder", "title"].forEach(attribute => {
            const attributes = originalAttributes.get(element) || {};
            const original = attributes[attribute] || element.getAttribute(attribute);

            if (original) {
                attributes[attribute] = original;
                originalAttributes.set(element, attributes);
            }

            if (original) {
                element.setAttribute(attribute, dictionary[original] || original);
            }
        });
    });
}

function setLanguage(language) {
    const selectedLanguage = languageOptions[language] || languageOptions.en;
    const navItems = document.querySelectorAll("#nav-links a");

    document.documentElement.lang = language === "ms" ? "ms" : language === "zh" ? "zh-CN" : "en";
    localStorage.setItem("viq-language", language);

    if (languageSwitcher) {
        languageSwitcher.querySelector(".language-code").textContent = selectedLanguage.code;
        languageSwitcher.setAttribute("aria-label", `Current language: ${selectedLanguage.label}`);
    }

    translatePage(language);
    translateLegalPage(language);

    navItems.forEach((link, index) => {
        if (selectedLanguage.nav[index]) {
            link.textContent = selectedLanguage.nav[index];
        }
    });

}

if (languageSwitcher) {
    const languageMenu = document.createElement("div");
    languageMenu.className = "language-menu";
    languageMenu.setAttribute("role", "menu");

    Object.entries(languageOptions).forEach(([language, option]) => {
        const menuItem = document.createElement("button");
        menuItem.type = "button";
        menuItem.className = "language-menu-item";
        menuItem.dataset.language = language;
        menuItem.setAttribute("role", "menuitem");
        menuItem.textContent = `${option.code}  ${option.label}`;
        languageMenu.appendChild(menuItem);
    });

    languageSwitcher.parentElement.classList.add("language-control");
    languageSwitcher.parentElement.appendChild(languageMenu);

    languageSwitcher.addEventListener("click", () => {
        const isOpen = languageSwitcher.getAttribute("aria-expanded") === "true";
        languageSwitcher.setAttribute("aria-expanded", String(!isOpen));
        languageMenu.classList.toggle("active", !isOpen);
    });

    languageMenu.addEventListener("click", event => {
        const selectedItem = event.target.closest("[data-language]");

        if (!selectedItem) {
            return;
        }

        setLanguage(selectedItem.dataset.language);
        languageSwitcher.setAttribute("aria-expanded", "false");
        languageMenu.classList.remove("active");
    });

    document.addEventListener("click", event => {
        if (!languageSwitcher.parentElement.contains(event.target)) {
            languageSwitcher.setAttribute("aria-expanded", "false");
            languageMenu.classList.remove("active");
        }
    });
}

setLanguage(localStorage.getItem("viq-language") || "en");

const bookingForm =
    document.getElementById("booking-form");

const startDateInput =
    document.getElementById("start-date");

const startTimeInput =
    document.getElementById("start-time");

const endDateInput =
    document.getElementById("end-date");

const endTimeInput =
    document.getElementById("end-time");

const preferredCarSelect =
    document.getElementById("preferred-car");

const pickupAreaInput =
    document.getElementById("pickup-area");

const bookingQuote =
    document.getElementById("booking-quote");

const contactForm =
    document.getElementById("contact-form");


/* =========================================
   WHATSAPP
========================================= */

/**
 * Opens WhatsApp with a pre-filled message.
 *
 * @param {string|null} carName
 */

function buildWhatsAppUrl(message) {

    const encodedMessage =
        encodeURIComponent(message);

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
}

function logBookingAttempt(booking) {
    if (!isFleetConfigured()) {
        return;
    }

    const payload = {
        ...booking,
        uid: "",
        status: "Inquiry Sent"
    };

    fetch(FLEET_WEB_APP_URL, {
        method: "POST",
        body: JSON.stringify(payload),
        keepalive: true,
        headers: { "Content-Type": "text/plain;charset=utf-8" }
    }).catch(() => {});
}

function openWhatsApp(carName = null, pickupLocation = PICKUP_LOCATION) {

    let message;

    if (carName) {

        message =
            `Hi ${BUSINESS_NAME}, I'm interested in renting the ${carName}. Is it available? Pickup location: ${pickupLocation}. I would like to know the rental rate and booking details.`;

    } else {

        message =
            `Hi ${BUSINESS_NAME}, I'm interested in renting a car. I would like to know about your available cars, rental rates and booking details.`;

    }

    if (carName) {
        logBookingAttempt({
            carName,
            pickupLocation,
            requestedDates: "",
            customerName: "",
            customerPhone: ""
        });
    }

    window.open(
        buildWhatsAppUrl(message),
        "_blank",
        "noopener,noreferrer"
    );
}

function openBookingWhatsApp(message, booking = {}) {

    logBookingAttempt(booking);

    window.open(
        buildWhatsAppUrl(message),
        "_blank",
        "noopener,noreferrer"
    );
}

if (contactForm) {
    contactForm.addEventListener("submit", event => {
        event.preventDefault();

        const formData = new FormData(contactForm);
        const message = [
            `Hi ${BUSINESS_NAME}, I'd like to make a rental enquiry.`,
            `Name: ${formData.get("name")}`,
            `WhatsApp: ${formData.get("phone")}`,
            `Pickup date: ${formData.get("pickup")}`,
            `Return date: ${formData.get("return")}`,
            `Pickup location: ${formData.get("location")}`,
            `Preferred car or type: ${formData.get("vehicle")}`,
            formData.get("message") ? `Message: ${formData.get("message")}` : ""
        ].filter(Boolean).join("\n");

        openBookingWhatsApp(message, {
            carName: formData.get("vehicle"),
            requestedDates: `${formData.get("pickup")} to ${formData.get("return")}`,
            pickupLocation: formData.get("location"),
            customerName: formData.get("name"),
            customerPhone: formData.get("phone")
        });
    });
}


/* =========================================
   GENERAL WHATSAPP BUTTONS
========================================= */

document
    .querySelectorAll("[data-whatsapp-general]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => openWhatsApp()
        );

    });


/* =========================================
   BOOKING QUOTE
========================================= */

function formatTimeLabel(value) {

    const [hours, minutes] = value.split(":").map(Number);
    const suffix = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 || 12;

    return `${hour12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

function populateBookingTimeOptions() {

    const timeSelects = [
        document.getElementById("start-time"),
        document.getElementById("end-time")
    ];

    timeSelects.forEach(select => {

        if (!select) {
            return;
        }

        const placeholder = select.id === "start-time"
            ? "Select start time"
            : "Select end time";

        const options = [
            `<option value="">${placeholder}</option>`
        ];

        for (let hour = 7; hour <= 21; hour += 1) {

            const minutes = hour === 21 ? [0] : [0, 30];

            for (const minute of minutes) {

                const value = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
                const label = formatTimeLabel(value);

                options.push(`<option value="${value}">${label}</option>`);

            }

        }

        select.innerHTML = options.join("");

    });
}

function populateBookingCarOptions() {

    if (!preferredCarSelect) {
        return;
    }

    preferredCarSelect.innerHTML = `
        <option value="">Select a preferred car model</option>
        ${cars.map(car => `
            <option value="${car.name}">
                ${car.name}
            </option>
        `).join("")}
    `;
}

function updateBookingPickupLocation() {

    if (!pickupAreaInput || !preferredCarSelect) {
        return;
    }

    const selectedCar = cars.find(
        car => car.name === preferredCarSelect.value
    );

    pickupAreaInput.value = selectedCar
        ? selectedCar.pickupLocation
        : "Select a car to see pickup location";
}

function calculateBookingQuote() {

    if (!startDateInput || !endDateInput || !preferredCarSelect || !bookingQuote) {
        return;
    }

    const startDateValue = startDateInput.value;
    const endDateValue = endDateInput.value;
    const selectedCarName = preferredCarSelect.value;

    if (!startDateValue || !endDateValue || !selectedCarName) {
        bookingQuote.textContent =
            "Choose your dates and a car to preview the estimate.";

        return;
    }

    const startDateOnly = new Date(`${startDateValue}T00:00:00`);
    const endDateOnly = new Date(`${endDateValue}T00:00:00`);

    if (endDateOnly <= startDateOnly) {
        bookingQuote.textContent =
            "End date must be after the start date.";

        return;
    }

    const selectedCar = cars.find(car => car.name === selectedCarName);

    if (!selectedCar) {
        bookingQuote.textContent =
            "Please choose a valid car model.";

        return;
    }

    updateBookingPickupLocation();

    const priceMatch = selectedCar.price.match(/\d+/);
    const dailyRate = priceMatch ? Number(priceMatch[0]) : 0;
    const durationMs = endDateOnly - startDateOnly;
    const rentalDays = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60 * 24)));
    const estimate = dailyRate * rentalDays;

    bookingQuote.textContent =
        `RM${estimate} for ${rentalDays} day${rentalDays > 1 ? "s" : ""}`;
}

function handleBookingSubmit(event) {

    event.preventDefault();

    if (!startDateInput || !endDateInput || !preferredCarSelect || !bookingQuote) {
        return;
    }

    const startDateValue = startDateInput.value;
    const endDateValue = endDateInput.value;
    const selectedCarName = preferredCarSelect.value;

    if (!startDateValue || !endDateValue || !selectedCarName) {
        bookingQuote.textContent =
            "Please complete all booking details before sending your request.";

        return;
    }

    const startTimeValue = startTimeInput?.value || "00:00";
    const endTimeValue = endTimeInput?.value || "00:00";

    const startDateOnly = new Date(`${startDateValue}T00:00:00`);
    const endDateOnly = new Date(`${endDateValue}T00:00:00`);

    if (endDateOnly <= startDateOnly) {
        bookingQuote.textContent =
            "End date must be after the start date.";

        return;
    }

    const selectedCar = cars.find(car => car.name === selectedCarName);

    if (!selectedCar) {
        bookingQuote.textContent =
            "Please choose a valid car model.";

        return;
    }

    const priceMatch = selectedCar.price.match(/\d+/);
    const dailyRate = priceMatch ? Number(priceMatch[0]) : 0;
    const durationMs = endDateOnly - startDateOnly;
    const rentalDays = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60 * 24)));
    const estimate = dailyRate * rentalDays;

    const formatDate = (dateValue) => {
        const [year, month, day] = dateValue.split("-");
        return `${day}/${month}/${year}`;
    };

    const formatTime = (timeValue) => {
        if (!timeValue) {
            return "00:00";
        }

        const [hours, minutes] = timeValue.split(":").map(Number);
        const suffix = hours >= 12 ? "PM" : "AM";
        const hour12 = hours % 12 || 12;

        return `${hour12}:${String(minutes).padStart(2, "0")} ${suffix}`;
    };

    const message =
        `Hi ${BUSINESS_NAME}\nI would like to book a rental.\nStart: ${formatDate(startDateValue)} ${formatTime(startTimeValue)}.\nEnd: ${formatDate(endDateValue)} ${formatTime(endTimeValue)}.\nPreferred car: ${selectedCarName}.\nPickup location: ${selectedCar.pickupLocation}.\nEstimated quote: RM${estimate} for ${rentalDays} day${rentalDays > 1 ? "s" : ""}.\nPlease confirm availability and booking details.`;

    openBookingWhatsApp(message, {
        carName: selectedCarName,
        requestedDates: `${startDateValue} ${startTimeValue} to ${endDateValue} ${endTimeValue}`,
        pickupLocation: selectedCar.pickupLocation,
        customerName: "",
        customerPhone: ""
    });
}

if (bookingForm) {
    bookingForm.addEventListener("submit", handleBookingSubmit);
}

[
    startDateInput,
    startTimeInput,
    endDateInput,
    endTimeInput
].forEach(input => {

    if (input) {
        input.addEventListener("change", calculateBookingQuote);
        input.addEventListener("input", calculateBookingQuote);
    }

});

if (preferredCarSelect) {
    preferredCarSelect.addEventListener("change", () => {
        updateBookingPickupLocation();
        calculateBookingQuote();
    });
}


/* =========================================
   RENDER CAR CARDS
========================================= */

function renderCars() {

    if (!carsGrid) {
        return;
    }

    carsGrid.innerHTML =
        cars.map(car => {

            const imageMarkup = car.image
                ? `
                    <img
                        class="car-image"
                        src="${car.image}"
                        alt="${car.name} available for rent from ${BUSINESS_NAME}"
                        loading="lazy"
                        width="800"
                        height="600"
                        onerror="this.replaceWith(Object.assign(document.createElement('div'), { className: 'car-image-placeholder', innerHTML: '<span>Photo unavailable</span>' }))"
                    >
                `
                : `
                    <div class="car-image-placeholder" aria-hidden="true">
                        <svg viewBox="0 0 64 40" width="56" height="35" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 26 L9 14 Q11 10 16 10 H44 Q49 10 51 14 L56 26 V32 Q56 34 54 34 H50 Q48 34 48 32 V30 H12 V32 Q12 34 10 34 H6 Q4 34 4 32 Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                            <circle cx="16" cy="30" r="4" stroke="currentColor" stroke-width="2"/>
                            <circle cx="46" cy="30" r="4" stroke="currentColor" stroke-width="2"/>
                            <path d="M13 20 H51" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        <span>Photo coming soon</span>
                    </div>
                `;

            const tagsMarkup =
                (car.tags || [])
                    .map(tag => `
                        <span class="car-tag">
                            <span class="car-tag-icon">✓</span>${tag}
                        </span>
                    `)
                    .join("");

            return `

                <article
                    class="car-card reveal"
                    data-car-id="${car.id}"
                    data-category="${car.category}"
                    data-transmission="${car.transmission.toLowerCase()}"
                    data-fuel="${car.fuel.toLowerCase()}"
                    data-pickup-location="${car.pickupLocation.toLowerCase()}"
                    data-features="${(car.tags || []).map(tag => tag.toLowerCase()).join(",")}"
                    data-price="${Number((car.price.match(/\d+/) || ["0"])[0])}"
                >

                    <div class="car-image-wrapper">
                        ${imageMarkup}
                    </div>


                    <div class="car-body">

                        <span class="car-badge">
                            ${car.category.toUpperCase()} &middot; ${car.year}
                        </span>

                        <div class="car-card-heading">
                            <h3>${car.name}</h3>

                            <div class="car-price">
                                <span>FROM</span>
                                <strong>${car.price.replace("/day", "")}</strong><small>/day</small>
                            </div>
                        </div>

                        <div class="car-tags">
                            ${tagsMarkup}
                        </div>

                        <p class="car-description">
                            ${car.description}
                        </p>

                        <p class="car-pickup">
                            <span aria-hidden="true">⌖</span>
                            Pickup: ${car.pickupLocation}
                        </p>


                        <div class="car-actions">

                            <button
                                class="btn btn-primary view-details car-check-btn"
                                type="button"
                                data-car-id="${car.id}"
                            >
                                Check Availability
                                <span class="car-check-arrow" aria-hidden="true">→</span>
                            </button>

                        </div>

                    </div>

                </article>

            `;

        }).join("");


    attachCarEvents();

    initializeRevealObserver();

}


/* =========================================
   CAR EVENTS
========================================= */

function attachCarEvents() {

    document
        .querySelectorAll(".view-details")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const carId = button.dataset.carId;

                    openCarModal(carId);

                }
            );

        });


    document
        .querySelectorAll(".book-car")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const carId =
                        Number(
                            button.dataset.carId
                        );

                    const car =
                        cars.find(
                            item =>
                                item.id === carId
                        );

                    if (car) {

                        openWhatsApp(car.name, car.pickupLocation);

                    }

                }
            );

        });

}

function updateFleetFilterCounts() {

    const countTargets = document.querySelectorAll("[data-count-for]");

    countTargets.forEach(target => {

        const key = target.dataset.countFor;

        let count = 0;

        if (key === "all") {
            count = cars.length;
        } else if (key === "automatic" || key === "manual") {
            count = cars.filter(
                car => car.transmission.toLowerCase() === key
            ).length;
        } else if (key === "petrol" || key === "diesel") {
            count = cars.filter(
                car => car.fuel.toLowerCase() === key
            ).length;
        } else {
            count = cars.filter(
                car => car.category === key
            ).length;
        }

        target.textContent = count;
    });
}

function initializeFleetFilters() {

    const filterForm = document.getElementById("fleet-filters");
    const searchInput = document.getElementById("fleet-search");
    const resultCount = document.getElementById("fleet-result-count");
    const priceRange = document.getElementById("fleet-price-range");
    const priceRangeValue = document.getElementById("fleet-price-range-value");
    const sortSelect = document.getElementById("fleet-sort");

    if (!filterForm || !carsGrid) {
        return;
    }

    const filterPanel = document.querySelector(".fleet-filter-panel");
    const resultsToolbar = document.querySelector(".fleet-results-toolbar");
    const mobileFilterToggle = document.querySelector("[data-mobile-filter-toggle]");
    const mobileCategoryToggle = document.querySelector("[data-mobile-category-toggle]");
    const mobileSortToggle = document.querySelector("[data-mobile-sort-toggle]");
    const resetFiltersButton = document.querySelector("[data-reset-filters]");

    mobileFilterToggle?.addEventListener("click", () => {
        const isOpen = filterPanel?.classList.toggle("mobile-filter-open") || false;
        filterPanel?.classList.remove("mobile-category-open");
        resultsToolbar?.classList.remove("mobile-sort-open");
        mobileFilterToggle.setAttribute("aria-expanded", String(isOpen));
        mobileCategoryToggle?.setAttribute("aria-expanded", "false");
        mobileSortToggle?.setAttribute("aria-expanded", "false");
    });

    mobileCategoryToggle?.addEventListener("click", () => {
        const isOpen = filterPanel?.classList.toggle("mobile-category-open") || false;
        filterPanel?.classList.remove("mobile-filter-open");
        resultsToolbar?.classList.remove("mobile-sort-open");
        mobileCategoryToggle.setAttribute("aria-expanded", String(isOpen));
        mobileFilterToggle?.setAttribute("aria-expanded", "false");
        mobileSortToggle?.setAttribute("aria-expanded", "false");
    });

    mobileSortToggle?.addEventListener("click", () => {
        const isOpen = resultsToolbar?.classList.toggle("mobile-sort-open") || false;
        filterPanel?.classList.remove("mobile-filter-open", "mobile-category-open");
        mobileSortToggle.setAttribute("aria-expanded", String(isOpen));
        mobileFilterToggle?.setAttribute("aria-expanded", "false");
        mobileCategoryToggle?.setAttribute("aria-expanded", "false");
        if (isOpen) {
            sortSelect?.focus();
        }
    });

    updateFleetFilterCounts();

    const applyFilters = () => {

        const searchValue = searchInput?.value.trim().toLowerCase() || "";

        const categoryValue =
            filterForm.elements.category
                ? filterForm.elements.category.value
                : "all";

        const transmissionBoxes =
            filterForm.querySelectorAll('input[name="transmission"]:checked');

        const fuelBoxes =
            filterForm.querySelectorAll('input[name="fuel"]:checked');

        const featureBoxes =
            filterForm.querySelectorAll('input[name="feature"]:checked');

        const activeTransmissions =
            Array.from(transmissionBoxes).map(box => box.value);

        const activeFuels =
            Array.from(fuelBoxes).map(box => box.value);

        const activeFeatures =
            Array.from(featureBoxes).map(box => box.value);

        const maxPrice =
            priceRange ? Number(priceRange.value) : Infinity;

        const cards = Array.from(carsGrid.querySelectorAll(".car-card"));
        let visibleCount = 0;

        cards.forEach(card => {

            const matchesSearch =
                !searchValue || card.textContent.toLowerCase().includes(searchValue);

            const matchesCategory =
                categoryValue === "all" || card.dataset.category === categoryValue;

            const matchesTransmission =
                activeTransmissions.length === 0
                || activeTransmissions.includes(card.dataset.transmission);

            const matchesFuel =
                activeFuels.length === 0
                || activeFuels.includes(card.dataset.fuel);

            const cardFeatures = (card.dataset.features || "").split(",");
            const matchesFeatures =
                activeFeatures.length === 0
                || activeFeatures.every(feature => cardFeatures.includes(feature));

            const matchesPrice =
                Number(card.dataset.price) <= maxPrice;

            const isVisible =
                matchesSearch && matchesCategory && matchesTransmission
                && matchesFuel && matchesFeatures
                && matchesPrice;

            card.hidden = !isVisible;

            if (isVisible) {
                visibleCount += 1;
            }
        });

        if (sortSelect) {

            const sortedCards = cards
                .filter(card => !card.hidden)
                .sort((a, b) => {

                    if (sortSelect.value === "price-asc") {
                        return Number(a.dataset.price) - Number(b.dataset.price);
                    }

                    if (sortSelect.value === "price-desc") {
                        return Number(b.dataset.price) - Number(a.dataset.price);
                    }

                    return 0;
                });

            sortedCards.forEach(card => carsGrid.appendChild(card));
        }

        if (resultCount) {
            resultCount.textContent = `${visibleCount} ${visibleCount === 1 ? "car" : "cars"} found`;
        }
    };

    if (priceRange) {

        const syncPriceLabel = () => {

            if (priceRangeValue) {
                priceRangeValue.textContent =
                    Number(priceRange.value) >= Number(priceRange.max)
                        ? `Max RM${priceRange.value}+`
                        : `Max RM${priceRange.value}`;
            }
        };

        priceRange.addEventListener("input", () => {
            syncPriceLabel();
            applyFilters();
        });

        syncPriceLabel();
    }

    filterForm.addEventListener("input", applyFilters);
    filterForm.addEventListener("change", applyFilters);
    searchInput?.addEventListener("input", applyFilters);
    sortSelect?.addEventListener("change", applyFilters);
    resetFiltersButton?.addEventListener("click", () => {
        filterForm.reset();
        if (priceRange) {
            priceRange.value = priceRange.max;
        }
        if (sortSelect) {
            sortSelect.value = "popular";
        }
        filterForm.dispatchEvent(new Event("change", { bubbles: true }));
    });
    applyFilters();
}


/* =========================================
   CAR MODAL
========================================= */

function openCarModal(carId) {

    const car =
        cars.find(
            item =>
                item.id === carId
        );

    if (!car) {
        return;
    }


    modalCarImage.src =
        car.image;

    modalCarImage.alt =
        `${car.name} rental vehicle`;


    modalCarName.textContent =
        car.name;


    modalPrice.textContent =
        car.price;


    modalAvailability.textContent =
        car.availability;


    modalDescription.textContent =
        car.description;


    modalSpecs.innerHTML = `

        <div class="modal-spec">

            <strong>
                ${car.transmission}
            </strong>

            <span>
                Transmission
            </span>

        </div>


        <div class="modal-spec">

            <strong>
                ${car.fuel}
            </strong>

            <span>
                Fuel
            </span>

        </div>


        <div class="modal-spec">

            <strong>
                ${car.seats}
            </strong>

            <span>
                Capacity
            </span>

        </div>

        <div class="modal-spec">
            <strong>
                ${car.pickupLocation}
            </strong>
            <span>
                Pickup location
            </span>
        </div>

    `;


    modalWhatsapp.onclick =
        () => openWhatsApp(car.name, car.pickupLocation);


    modal.classList.add("active");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "modal-open"
    );

    modalClose.focus();

}


/* =========================================
   CLOSE MODAL
========================================= */

function closeCarModal() {

    if (!modal) {
        return;
    }

    modal.classList.remove("active");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove(
        "modal-open"
    );

}


if (modalClose) {
    modalClose.addEventListener(
        "click",
        closeCarModal
    );
}

const modalBackdrop =
    document.querySelector(".modal-backdrop");

if (modalBackdrop) {
    modalBackdrop.addEventListener(
        "click",
        closeCarModal
    );
}


document.addEventListener(
    "keydown",
    event => {

        if (event.key === "Escape" && modal?.classList.contains("active")) {

            closeCarModal();

        }

    }
);


/* =========================================
   MOBILE NAVIGATION
========================================= */

if (menuToggle && navLinks) {
    menuToggle.addEventListener(
        "click",
        () => {

        const isOpen =
            navLinks.classList.toggle(
                "active"
            );

            menuToggle.setAttribute(
                "aria-expanded",
                isOpen
            );

        }
    );
}


/* Close mobile navigation after link click */

document
    .querySelectorAll(".nav-links a")
    .forEach(link => {

        link.addEventListener(
            "click",
            () => {

                navLinks?.classList.remove(
                    "active"
                );

                menuToggle?.setAttribute(
                    "aria-expanded",
                    "false"
                );

            }
        );

    });


/* =========================================
   HEADER SCROLL EFFECT
========================================= */

function handleHeaderScroll() {

    if (
        window.scrollY > 40
    ) {

        siteHeader.classList.add(
            "scrolled"
        );

    } else {

        siteHeader.classList.remove(
            "scrolled"
        );

    }

}

window.addEventListener(
    "scroll",
    handleHeaderScroll,
    {
        passive: true
    }
);

handleHeaderScroll();


/* =========================================
   FAQ ACCORDION
========================================= */

document
    .querySelectorAll(".faq-question")
    .forEach(question => {

        question.addEventListener(
            "click",
            () => {

                const currentItem =
                    question.closest(
                        ".faq-item"
                    );

                const isActive =
                    currentItem.classList.contains(
                        "active"
                    );


                /*
                 * Close all other FAQ items
                 */

                document
                    .querySelectorAll(".faq-item")
                    .forEach(item => {

                        item.classList.remove(
                            "active"
                        );

                        item
                            .querySelector(
                                ".faq-question"
                            )
                            .setAttribute(
                                "aria-expanded",
                                "false"
                            );

                    });


                /*
                 * Open selected item
                 */

                if (!isActive) {

                    currentItem.classList.add(
                        "active"
                    );

                    question.setAttribute(
                        "aria-expanded",
                        "true"
                    );

                }

            }
        );

    });


/* =========================================
   BUSINESS INFORMATION
========================================= */

document
    .querySelectorAll(
        "[data-business-whatsapp]"
    )
    .forEach(element => {

        element.textContent =
            PHONE_NUMBER;

    });


document
    .querySelectorAll(
        "[data-business-phone]"
    )
    .forEach(element => {

        element.textContent =
            PHONE_NUMBER;

    });


document
    .querySelectorAll(
        "[data-phone-link]"
    )
    .forEach(element => {

        element.href =
            `tel:${PHONE_NUMBER.replace(
                /[^\d+]/g,
                ""
            )}`;

    });


/* =========================================
   CURRENT YEAR
========================================= */

const currentYear =
    document.getElementById(
        "current-year"
    );

if (currentYear) {

    currentYear.textContent =
        new Date().getFullYear();

}


/* =========================================
   SCROLL REVEAL
========================================= */

let revealObserver;


function initializeRevealObserver() {

    const revealElements =
        document.querySelectorAll(
            ".reveal:not(.visible)"
        );


    if (
        !("IntersectionObserver" in window)
    ) {

        revealElements
            .forEach(element => {

                element.classList.add(
                    "visible"
                );

            });

        return;

    }


    if (!revealObserver) {

        revealObserver =
            new IntersectionObserver(
                entries => {

                    entries.forEach(
                        entry => {

                            if (
                                entry.isIntersecting
                            ) {

                                entry.target.classList.add(
                                    "visible"
                                );

                                revealObserver.unobserve(
                                    entry.target
                                );

                            }

                        }
                    );

                },
                {
                    threshold: 0.1
                }
            );

    }


    revealElements
        .forEach(element => {

            revealObserver.observe(
                element
            );

        });

}


/* =========================================
   INITIALIZE
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        populateBookingTimeOptions();

        setLanguage(localStorage.getItem("viq-language") || "en");

        initializeRevealObserver();

        if (await loadFleetData()) {
            populateBookingCarOptions();
        }

    }
);