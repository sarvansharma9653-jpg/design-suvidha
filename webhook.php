<?php
$VERIFY_TOKEN = "design_suvidha_12345"; // yehi aap Meta me daloge

// 1. Verification ke liye (Meta GET request bhejta hai)
if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    if (isset($_GET['hub_verify_token']) && $_GET['hub_verify_token'] == $VERIFY_TOKEN) {
        echo $_GET['hub_challenge'];
        exit;
    } else {
        echo "Verification token mismatch";
        exit;
    }
}

// 2. Message receive karne ke liye (Meta POST request bhejta hai)
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = file_get_contents("php://input");
    $logFile = "whatsapp_log.txt";
    file_put_contents($logFile, $data . "\n\n", FILE_APPEND);
    
    // yaha aap database me save ya auto-reply ka logic laga sakte ho
    http_response_code(200);
    exit;
}
?>
