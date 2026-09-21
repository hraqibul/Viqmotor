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