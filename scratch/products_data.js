// 100% Verified Google Drive Physical Gift Catalog with Exact Image-to-Text Mapping
const ACCURATE_PRODUCTS = [
    // --- 1. MUGS ---
    {
        id: 'prod-mug-morning',
        title: 'Morning Ceramic Mug – 330 ml',
        category: 'mugs',
        catLabel: 'Personalised Mug',
        price: 199,
        strike: 299,
        badge: 'Best Seller 🔥',
        img: 'assets/products/product_1.jpg',
        desc: 'Your Day, Your Mug, Your Way. Glossy ceramic with smooth premium finish. Vibrant HD sublimation print that stays bright sip after sip.',
        features: ['Personalize It: Photo • Name • Logo', 'Glossy Ceramic Smooth Premium Finish', '330 ML Perfect Everyday Size']
    },
    {
        id: 'prod-mug-inner-color',
        title: 'Choose Your Color Inner Mug – 330 ml',
        category: 'mugs',
        catLabel: 'Personalised Mug',
        price: 230,
        strike: 340,
        badge: 'Trending ✨',
        img: 'assets/products/product_3.jpg',
        desc: 'White body with colorful inside & handle. Vibrant inner colors: Red, Blue, Yellow, Green, Pink, and Black with high contrast exterior print.',
        features: ['6 Vibrant Inner Color Options', 'White Body with Color Inside & Handle', 'High Contrast Sublimation Photo Print']
    },
    {
        id: 'prod-mug-heartbeat',
        title: 'Heartbeat Mug – 330 ml (Heart-Shaped Handle)',
        category: 'mugs',
        catLabel: 'Personalised Mug',
        price: 249,
        strike: 380,
        badge: 'Special Gift ❤️',
        img: 'assets/products/product_7.jpg',
        desc: 'Heartbeat Mug with unique heart-shaped handle. Perfect for anniversary gifts, couple photos, birthdays, and special expressions.',
        features: ['Heart-Shaped Handle: Unique & Eye-Catching', 'Personalize: Photo • Name • Message', '330 ML Perfect Everyday Size']
    },
    {
        id: 'prod-mug-mini-chai',
        title: 'Mini Ceramic Chai Mug – 190 ml',
        category: 'mugs',
        catLabel: 'Personalised Mug',
        price: 199,
        strike: 280,
        badge: 'Chai Lovers ☕',
        img: 'assets/products/product_9.jpg',
        desc: 'Authentic 190 ml portion—the exact gold-standard volume for Indian chai, filter coffee, or espresso. Available in Standard & Fine Ceramic.',
        features: ['190 ml Ideal Chai/Espresso Size', 'Standard & Fine Ceramic Quality Options', 'Custom Photo • Text • Logo Branding']
    },

    // --- 2. CARD HOLDERS ---
    {
        id: 'prod-cardholder-solid',
        title: 'Solid Series Card Holder',
        category: 'cardholders',
        catLabel: 'Card Holder',
        price: 149,
        strike: 249,
        badge: 'Solid Series',
        img: 'assets/products/product_11.jpg',
        desc: 'Carry with Strength. Lead with Style. Vibrant solid colors add a positive touch. Slim and pocket-friendly compact design with steel clip.',
        features: ['Solid Colors: Mint Green, Yellow, Red', 'Slim & Pocket-Friendly Compact Design', 'Steel Clip & Secure Card Protection']
    },
    {
        id: 'prod-cardholder-signature',
        title: 'Signature Pattern Card Holder',
        category: 'cardholders',
        catLabel: 'Card Holder',
        price: 179,
        strike: 299,
        badge: 'Luxury Textured',
        img: 'assets/products/product_13.jpg',
        desc: 'Carry with Strength. Lead with Style. Luxury textured finish with refined pattern for a stylish look. Keeps your cards safe and organized.',
        features: ['Refined Luxury Textured Finish', 'Colors: Black, Maroon, Pink', 'Durable Stainless Steel Accent & Clasp']
    },
    {
        id: 'prod-cardholder-commander',
        title: 'Commander Edition Card Holder',
        category: 'cardholders',
        catLabel: 'Card Holder',
        price: 189,
        strike: 299,
        badge: 'Commander Edition 🎖️',
        img: 'assets/products/product_15.jpg',
        desc: 'Bold design, everyday utility. Military-inspired bold camouflage finish with a distinctive executive look. Compact and lightweight.',
        features: ['Military-Inspired Camouflage Design', 'Slim & Pocket-Friendly Build', 'Stainless Steel Safe Engraving Plate']
    },
    {
        id: 'prod-cardholder-goldaccent',
        title: 'Gold Accent Card Holder',
        category: 'cardholders',
        catLabel: 'Card Holder',
        price: 199,
        strike: 320,
        badge: 'Gold Accent 🌟',
        img: 'assets/products/product_17.jpg',
        desc: 'Professional look, everyday convenience. Premium gold accent for a refined look. Slim & compact, easily fits in pocket or bag.',
        features: ['Premium Gold Curved Accent', 'Available in 3 Colors: Black, Brown, Navy', 'Laser Engraved Personal Name/Brand']
    },
    {
        id: 'prod-cardholder-magnetic',
        title: 'NextGen Magnetic Visiting Card Case',
        category: 'cardholders',
        catLabel: 'Card Holder',
        price: 229,
        strike: 350,
        badge: 'Magnetic Cap 🧲',
        img: 'assets/products/product_19.jpg',
        desc: 'Executive magnetic cap snap closure. Polished stainless steel base with textured leatherette lid. Holds 15-20 business cards securely.',
        features: ['Precision Magnetic Snap-Close Action', 'Polished Stainless Steel Trim Frame', 'Stores 15–20 Standard Visiting Cards']
    },

    // --- 3. BRANDED METAL PENS ---
    {
        id: 'prod-pen-click',
        title: 'Classic Metal Click Pen',
        category: 'pens',
        catLabel: 'Branded Metal Pen',
        price: 90,
        strike: 150,
        badge: 'Classic Design',
        img: 'assets/products/product_20.jpg',
        desc: 'Classic design, everyday performance. Premium metal body with smooth click action. Permanent & elegant laser engraved brand or name.',
        features: ['Smooth Click Action: Press, Write, Repeat', 'Colors: Black, White, Blue, Grey, Maroon', 'Permanent Precision Laser Engraving']
    },
    {
        id: 'prod-pen-box',
        title: 'Plastic Pen Presentation Box',
        category: 'pens',
        catLabel: 'Pen Gift Box',
        price: 45,
        strike: 80,
        badge: 'Gift Box 🎁',
        img: 'assets/products/product_21.jpg',
        desc: 'Simple, practical, perfect for gifting. Durable plastic body with moulded interior for secure pen fit. Available in Silver & Gold.',
        features: ['Available in 2 Finishes: Silver & Gold', 'Moulded Interior Secures Pen Firmly', 'Ideal for Corporate Gifting & Bundles']
    },
    {
        id: 'prod-pen-magnetic-gel',
        title: 'Premium Magnetic Gel Metal Pen',
        category: 'pens',
        catLabel: 'Branded Metal Pen',
        price: 199,
        strike: 299,
        badge: 'Magnetic Cap 🧲',
        img: 'assets/products/product_24.jpg',
        desc: 'Smart magnetic cap with snap-close convenience. Ultra-smooth gel writing mechanism designed for a smarter writing experience.',
        features: ['Pull Up to Write, Snap Close Automatically', 'Smooth, Precise, Effortless Gel Refill', 'Cap / Barrel Laser Engraved Branding']
    },
    {
        id: 'prod-pen-black-twist',
        title: 'Premium Black Metal Pen (Twist Action)',
        category: 'pens',
        catLabel: 'Branded Metal Pen',
        price: 229,
        strike: 350,
        badge: 'Black is Class',
        img: 'assets/products/product_27.jpg',
        desc: 'Black Is Class. Premium metal finish with elegant rose gold clip design and smooth twist action. Built to impress in boardrooms.',
        features: ['Smooth Twist to Write / Twist Back to Close', 'Elegant Rose Gold Clip & Dual Ring Accents', 'Matte Black Body with Permanent Engraving']
    },
    {
        id: 'prod-pen-textured-grip',
        title: 'Premium Textured Grip Metal Pen',
        category: 'pens',
        catLabel: 'Branded Metal Pen',
        price: 199,
        strike: 300,
        badge: 'Textured Grip',
        img: 'assets/products/product_29.jpg',
        desc: 'Comfortable grip, professional impression. Micro-textured knurled grip zone provides non-slip control during long writing sessions.',
        features: ['Anti-Slip Micro-Textured Grip Zone', 'Smooth Twist Action Mechanism', 'Durable Metal Build with Laser Engraving']
    },
    {
        id: 'prod-pen-gold-accent',
        title: 'Premium Gold Accent Metal Pen',
        category: 'pens',
        catLabel: 'Branded Metal Pen',
        price: 249,
        strike: 399,
        badge: 'Gold Accent 👑',
        img: 'assets/products/product_32.jpg',
        desc: 'Simple. Stylish. Signature. Flagship metallic pen accented with radiant gold rings and clip. Smooth twist mechanism and weighted balance.',
        features: ['Polished Gold Clip & Accent Trim Rings', 'Smooth Effortless Twist Writing Action', 'Precision Laser Engraving on Cap or Body']
    },

    // --- 4. CUSTOM KEYCHAINS ---
    {
        id: 'prod-keychain-oval',
        title: 'Silver Oval Metal Keychain',
        category: 'keychains',
        catLabel: 'Custom Keychain',
        price: 89,
        strike: 149,
        badge: 'Carry Style',
        img: 'assets/products/product_34.jpg',
        desc: 'Carry Style. Leave a Mark. Compact and easy to carry with durable metal build and premium matte black inlay for laser engraving.',
        features: ['Compact & Easy to Carry Oval Profile', 'Durable Heavy Metal Construction', 'Permanent Custom Laser Engraving']
    },
    {
        id: 'prod-keychain-house',
        title: 'House Shape Metal Keychain',
        category: 'keychains',
        catLabel: 'Custom Keychain',
        price: 99,
        strike: 160,
        badge: 'Real Estate Special 🏠',
        img: 'assets/products/product_36.jpg',
        desc: 'Carry A Little Home With You. Distinctive house-shaped profile with premium polished finish. Perfect for Real Estate, Builders & Griha Pravesh.',
        features: ['Iconic House Silhouette Shape', 'Durable & Polished Chrome Build', 'Ideal for Branding, Real Estate & Home Gifts']
    },
    {
        id: 'prod-keychain-round',
        title: 'Round Metal Keychain',
        category: 'keychains',
        catLabel: 'Custom Keychain',
        price: 89,
        strike: 149,
        badge: 'Round Metal',
        img: 'assets/products/product_38.jpg',
        desc: 'Simple. Strong. Made for Every Day. Classic circular medal medallion design crafted from durable metal for corporate & personal gifting.',
        features: ['Durable Solid Metal Construction', 'High-Contrast Laser Logo Engraving', 'Heavy-Duty 30mm Split Key Ring']
    },
    {
        id: 'prod-keychain-capsule',
        title: 'Capsule Metal Keychain',
        category: 'keychains',
        catLabel: 'Custom Keychain',
        price: 99,
        strike: 169,
        badge: 'Capsule Design',
        img: 'assets/products/product_40.jpg',
        desc: 'Small in Size. Big on Style. Sleek capsule geometry available in Silver, Gold, and Rose Gold border options with matte black face.',
        features: ['Available in Silver, Gold & Rose Gold', 'Sleek Rounded Capsule Design', 'Laser Engraved City, Brand or Personal Name']
    },
    {
        id: 'prod-keychain-carabiner',
        title: 'Carabiner Dual Ring Keychain',
        category: 'keychains',
        catLabel: 'Custom Keychain',
        price: 129,
        strike: 210,
        badge: 'Double Function',
        img: 'assets/products/product_42.jpg',
        desc: 'One Keychain. Double Function. Features carabiner lock design, dual ring setup, and 360° rotatable swivel hook for ultimate utility.',
        features: ['Spring Carabiner Lock & Belt Clip', 'Dual Ring Setup for Keys & Remotes', '360° Rotatable Heavy Duty Swivel Hook']
    },
    {
        id: 'prod-keychain-leather',
        title: 'Premium PU Leather Keychain',
        category: 'keychains',
        catLabel: 'Custom Keychain',
        price: 119,
        strike: 199,
        badge: 'PU Leather',
        img: 'assets/products/product_44.jpg',
        desc: 'Crafted for a Lasting Impression. Supple premium PU leather loop combined with precision laser engraved metal plate.',
        features: ['Premium PU Leather in Black & Brown', 'Precision Laser Engraving on Steel Plate', 'Durable Heavy-Duty Key Ring']
    },
    {
        id: 'prod-keychain-opener',
        title: 'Carabiner Bottle Opener Keychain',
        category: 'keychains',
        catLabel: 'Custom Keychain',
        price: 139,
        strike: 220,
        badge: '2-in-1 Opener 🍾',
        img: 'assets/products/product_46.jpg',
        desc: 'Smart Design. Strong Utility. Combines a sturdy keychain carabiner and functional bottle opener. Practical everyday accessory.',
        features: ['2-in-1 Carabiner Clip & Bottle Opener', 'Available in 5 Colors: Black, Blue, White, Brown, Tan', 'Sturdy Metal Build with Secure Key Ring']
    },

    // --- 5. EXECUTIVE DIARIES ---
    {
        id: 'prod-diary-magnetic',
        title: 'Magnetic Lock Executive Diary',
        category: 'diaries',
        catLabel: 'Executive Diary',
        price: 299,
        strike: 450,
        badge: 'Magnetic Lock 🔒',
        img: 'assets/products/product_48.jpg',
        desc: 'Premium magnetic lock with silver or gold metal plate. 192 ruled pages (80 GSM paper) for smooth writing. Laser engraved name or logo.',
        features: ['Concealed Magnetic Lock Flap with Engraved Plate', '192 Ruled Pages (80 GSM Paper)', 'Available in Black & Rich Brown Leatherette']
    },
    {
        id: 'prod-diary-color-reveal',
        title: 'Color Reveal Executive Diary (A5)',
        category: 'diaries',
        catLabel: 'Executive Diary',
        price: 279,
        strike: 399,
        badge: 'Color Reveal 🎨',
        img: 'assets/products/product_49.jpg',
        desc: 'Laser printing that reveals vibrant color! Premium PU cover with integrated elastic closure and pen loop. Available in Blue, Orange & Green.',
        features: ['Laser Engraving Reveals Vibrant Accent Color', 'A5 Size (15 x 21 cm) / 192 Pages 80 GSM Paper', 'Elastic Closure & Matching Pen Loop']
    },
    {
        id: 'prod-diary-roundlock',
        title: 'Royal Round Lock Executive Diary',
        category: 'diaries',
        catLabel: 'Executive Diary',
        price: 329,
        strike: 499,
        badge: 'Royal Round Lock 👑',
        img: 'assets/products/product_50.jpg',
        desc: 'Distinctive round lock with elegant and unique gold design. Superior quality PU cover with regal patterned border and personalized engraving.',
        features: ['Distinctive Gold Round Lock Clasp', 'Superior Quality Textured Navy PU Cover', 'Personalised Laser Engraved Brand / Name']
    },
    {
        id: 'prod-diary-gold-border',
        title: 'Gold Double-Border Executive Diary',
        category: 'diaries',
        catLabel: 'Executive Diary',
        price: 349,
        strike: 520,
        badge: 'Gold Gilded 🌟',
        img: 'assets/products/product_51.jpg',
        desc: 'A Diary for Brighter Days. Elegant double-line gold border design with stylish lined texture on premium PU cover and engraved metal clasp.',
        features: ['Classic Double-Line Gold Foil Border', 'Stylish Lined Texture Premium PU Cover', 'Personalised Laser Engraving on Magnetic Lock']
    },

    // --- 6. MOUSEPADS & ACCESSORIES ---
    {
        id: 'prod-mousepad-desk',
        title: 'Non-Slip Custom Mouse Pad (7x9.5")',
        category: 'mousepads',
        catLabel: 'Office Accessory',
        price: 99,
        strike: 199,
        badge: 'Best Value 🖱️',
        img: 'assets/products/product_52.jpg',
        desc: 'Smooth fabric surface for precise & comfortable mouse movement. 3 mm thickness balanced everyday comfort with anti-slip rubber base.',
        features: ['Smooth Micro-Weave Fabric Surface', '3 MM Thickness for Balanced Comfort', 'Non-Slip Natural Rubber Base (7 x 9.5 Inch)']
    },

    // --- 7. SMART DRINKWARE & BOTTLES ---
    {
        id: 'prod-bottle-temperature',
        title: 'Smart LED Temperature Bottle – 500 ml',
        category: 'drinkware',
        catLabel: 'Smart Drinkware',
        price: 299,
        strike: 499,
        badge: 'Smart LED 🌡️',
        img: 'assets/products/product_53.jpg',
        desc: 'Touch-activated LED temperature display lid. 304 food-grade stainless steel with 6-12 hours hot/cold vacuum insulation and 500-day battery.',
        features: ['Touch-Activated Real-Time Temperature Display', 'Double Wall SUS 304 Stainless Steel', 'Leak-Proof Screw Lid & Stable Anti-Slip Base']
    },
    {
        id: 'prod-bottle-rope',
        title: 'Vacuum Bottle with Carry Rope – 500 ml',
        category: 'drinkware',
        catLabel: 'Smart Drinkware',
        price: 349,
        strike: 550,
        badge: 'Sport Lifestyle 🏃',
        img: 'assets/products/product_54.jpg',
        desc: 'Features an easy-carry rope convenient for work & travel. 10 hours hot and 30 hours cold double-wall insulation with leak-proof screw cap.',
        features: ['Easy-Carry Rope Lanyard Handle', '10 Hrs Hot • 30 Hrs Cold Retention', '304 Stainless Steel with Leak-Proof Screw Cap']
    },
    {
        id: 'prod-bottle-matte-black',
        title: 'Matte Black Vacuum Bottle – 500 ml',
        category: 'drinkware',
        catLabel: 'Smart Drinkware',
        price: 449,
        strike: 680,
        badge: 'Stealth Matte 🖤',
        img: 'assets/products/product_55.jpg',
        desc: 'Matte black vacuum bottle in sleek corporate finish. Double-wall stainless steel vacuum insulation with leak-proof lid for hot & cold protection.',
        features: ['Tactile Non-Slip Matte Stealth Finish', 'Double-Wall Stainless Steel Vacuum Insulation', 'Leak-Proof Secure Closure for Carrying']
    },
    {
        id: 'prod-tumbler-straw',
        title: 'Vacuum Tumbler with Straw – 900 ml',
        category: 'drinkware',
        catLabel: 'Smart Drinkware',
        price: 549,
        strike: 850,
        badge: 'Mega 900ml 🥤',
        img: 'assets/products/product_56.jpg',
        desc: 'Massive 900 ml capacity for all-day hydration. 18/8 stainless steel double-wall vacuum insulation with reusable straw and folding carry handle.',
        features: ['Massive 900 ml Hydration Capacity', '18/8 Stainless Steel Double-Wall Vacuum', 'Reusable Straw & Ergonomic Carry Handle']
    }
];

module.exports = ACCURATE_PRODUCTS;
