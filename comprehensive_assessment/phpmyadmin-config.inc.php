<?php
/**
 * phpMyAdmin configuration for UTF-8 support
 */

/* Force UTF-8 globally */
ini_set('default_charset', 'utf-8');
header('Content-Type: text/html; charset=utf-8');

/* Servers configuration */
$i = 0;

/* Server: MySQL */
$i++;
$cfg['Servers'][$i]['verbose'] = 'MySQL';
$cfg['Servers'][$i]['host'] = 'database';
$cfg['Servers'][$i]['port'] = '3306';
$cfg['Servers'][$i]['auth_type'] = 'cookie';
$cfg['Servers'][$i]['user'] = '';
$cfg['Servers'][$i]['password'] = '';

/* UTF-8 configuration */
$cfg['Servers'][$i]['extension'] = 'mysqli';
$cfg['Servers'][$i]['connect_type'] = 'tcp';
$cfg['Servers'][$i]['compress'] = false;
$cfg['Servers'][$i]['AllowNoPassword'] = false;
$cfg['Servers'][$i]['charset'] = 'utf8mb4';
$cfg['Servers'][$i]['collation_connection'] = 'utf8mb4_unicode_ci';

/* Force connection to use UTF-8 */
$cfg['Servers'][$i]['SessionTimeZone'] = '+00:00';
$cfg['Servers'][$i]['init_commands'] = array(
    "SET SQL_MODE=''",
    "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
);

/* Global settings */
$cfg['DefaultCharset'] = 'utf8mb4';
$cfg['CharEditing'] = 'utf8mb4';
$cfg['DefaultLang'] = 'en';
$cfg['Lang'] = 'en';
$cfg['ForceSSL'] = false;
$cfg['CheckConfigurationPermissions'] = false;
$cfg['blowfish_secret'] = 'your-secret-key-here-32-characters-long-12345678';

/* Additional UTF-8 settings */
$cfg['RecodingEngine'] = 'auto';
$cfg['IconvExtraParams'] = '//TRANSLIT';
$cfg['ZipDump'] = true;
$cfg['GZipDump'] = true;

/* Advanced phpMyAdmin features */
$cfg['Servers'][$i]['controluser'] = '';
$cfg['Servers'][$i]['controlpass'] = '';
$cfg['Servers'][$i]['pmadb'] = '';
$cfg['Servers'][$i]['bookmarktable'] = '';
$cfg['Servers'][$i]['relation'] = '';
$cfg['Servers'][$i]['table_info'] = '';
$cfg['Servers'][$i]['table_coords'] = '';
$cfg['Servers'][$i]['pdf_pages'] = '';
$cfg['Servers'][$i]['column_info'] = '';
$cfg['Servers'][$i]['history'] = '';
$cfg['Servers'][$i]['table_uiprefs'] = '';
$cfg['Servers'][$i]['tracking'] = '';
$cfg['Servers'][$i]['userconfig'] = '';
$cfg['Servers'][$i]['recent'] = '';
$cfg['Servers'][$i]['favorite'] = '';
$cfg['Servers'][$i]['users'] = '';
$cfg['Servers'][$i]['usergroups'] = '';
$cfg['Servers'][$i]['navigationhiding'] = '';
$cfg['Servers'][$i]['savedsearches'] = '';
$cfg['Servers'][$i]['central_columns'] = '';
$cfg['Servers'][$i]['designer_settings'] = '';
$cfg['Servers'][$i]['export_templates'] = '';

/* Other settings */
$cfg['blowfish_secret'] = 'your-secret-key-here-32-characters';
$cfg['DefaultLang'] = 'zh_CN';
$cfg['ServerDefault'] = 1;
$cfg['UploadDir'] = '';
$cfg['SaveDir'] = '';
$cfg['TempDir'] = '/tmp';

/* Force UTF-8 */
$cfg['ForceSSL'] = false;
$cfg['CheckConfigurationPermissions'] = false;
