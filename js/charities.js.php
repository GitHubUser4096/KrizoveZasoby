<?php

// TODO DEPRECATED

header("Content-Type: text/javascript");

echo "\n/* lib/js/utils.js */\n";
include '../lib/js/utils.js';

echo "\n/* application.js */\n";
include 'application.js';

echo "\n/* layoutManager.js */\n";
include 'layoutManager.js';

echo "\n/* requests.js */\n";
include 'requests.js';

echo "\n/* page.js */\n";
include 'page.js';

echo "\n/* charities.js */\n";
include 'charities.js';

?>