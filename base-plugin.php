<?php
/*
Plugin Name: Base WordPress Plugin
Plugin URI: https://github.com/duanestorey/base-plugin
Description: A skeleton of a minimal WordPress plugin, complete with tooling
Version: 1.0
Author: Duane Storey
Author URI: https://duanestorey.com
Text Domain: base-plugin
Domain Path: /lang
*/

namespace My_Awesome_Plugin;

function load_base_plugin {

}

add_action( 'plugins_loaded', 'load_base_plugin' );