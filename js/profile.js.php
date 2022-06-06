<?php

header("Content-Type: text/javascript");

echo "\n/* lib/js/utils.js */\n";
include '../lib/js/utils.js';

echo "\n/* lib/js/jscoord-1.1.1.js */\n";
include '../lib/js/jscoord-1.1.1.js';

echo "\n/* application.js */\n";
include 'application.js';

echo "\n/* layoutManager.js */\n";
include 'layoutManager.js';

echo "\n/* requests.js */\n";
include 'requests.js';

echo "\n/* page.js */\n";
include 'page.js';

echo "\n/* item.js */\n";
include 'item.js';

echo "\n/* profile.js */\n";
include 'profile.js';

?>