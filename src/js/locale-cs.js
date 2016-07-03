App.GLocalCS = {
    sign_in_header             : "Vítejte v OPS",
    sign_in_label              : "OTEVŘENÍ OBCHODU",
    sign_in_username           : "UŽIVATELSKÉ JMÉNO",
    sign_in_password           : "HESLO",
    sign_in_sign_in            : "PŘIHLÁSIT SE",
    sign_in_sign_up            : "Registrace",
    sign_in_forgot             : "Zapomenuté heslo",
    sign_in_enter_ep           : "Pro přihlášení zadejte email a heslo",
    sign_in_invalid_employee   : "Nesprávný login zaměstnance",
            
    sign_up_header             : "Vítejte v OPS",
    sign_up_label              : "VYTVOŘENÍ NOVÉHO OBCHODU",
    sign_up_email              : "EMAIL",
    sign_up_password           : "HESLO",
    sign_up_confirm_password   : "POTVRDIT HESLO",
    sign_up_name               : "Název podniku",
    sign_up_tin                : "IČO",
    sign_up_vat                : "DIČ",
    sign_up_street             : "Ulice, čp./čo.",
    sign_up_city               : "Město",
    sign_up_zip                : "PSČ",
    sign_up_country            : "Stát",
    sign_up_phone              : "Telefon",
    sign_up_czk                : "CZK - Česká koruna",
    sign_up_sign_up            : "VYTVOŘIT ÚČET",
    sign_up_back               : "Zpět na přihlášení",
    sign_up_thank              : function (msg) {return "Děkujeme za vytvoření účtu<br>Zkontrolujte svou e-mailovou schránku <strong>" + msg + "</strong> pro dokončení registrace";},
    sign_up_fail               : function (msg) {return "Nepodařilo se nám vytvořit účet<br><strong>" + msg + "</strong><br>Dejte nám vědět na <a href='mailto:etherealcz@gmail.com'>etherealcz@gmail.com</a>";},
    
    forgot_header              : "Vítejte v OPS",
    forgot_label               : "OBNOVENÍ HESLA",
    forgot_email               : "EMAIL",
    forgot_instruction         : "Po stisknutí ODESLAT dostanete v mailu odkaz na obnovení hesla",
    forgot_submit              : "ODESLAT",
    forgot_back                : "Zpět na přihlášení",
    forgot_success             : function (msg) {return "Poslali jsme na Váš email <strong>" + msg + "</strong> odkaz na obnovení hesla" ;},
    forgot_fail                : function (msg) {return "Nepodařilo se vyřídit Váš požadavek<br><strong>" + msg + "</strong><br>Dejte nám vědět na <a href='mailto:etherealcz@gmail.com'>etherealcz@gmail.com</a>";},
    
    dashboard_sign_out         : "Odhlásit se",
    dashboard_unable_sign_out  : "Nepodařilo se odhlásit. Zkontrolujte spojení",
    dashboard_header           : "Otevření pokladny",
    dashboard_label            : "PŘIHLÁŠENÍ ZAMĚSTNANCE",
    dashboard_username         : "UŽIVATELSKÉ JMÉNO",
    
    reg_open_cp                : "Otevřít ovládací panel",
    reg_close_sg               : "Zavřít zbožní skupiny",
    reg_mute                   : "Ztlumit zvuky",
    reg_logout                 : "Zamknout",
    reg_cp                     : "Ovládací panel",
    reg_checkout               : "POKLADNA",
    reg_items                  : "položek",
    reg_item                   : "položka",
    reg_item_plural            : "položky",
    reg_total                  : "Celkem",
    reg_park                   : "Zaparkovat",
    reg_discard                : "Zrušit prodej",
    reg_print_last             : "Tisk poslední",
    reg_print_on               : "Tisk ON",
    reg_print_off              : "Tisk OFF",
    reg_no_last_receipt        : "V historii nejsou žádné prodeje",
    reg_si_placeholder         : "Zde se zobrazují namarkované položky",
    reg_pay                    : "Zaplatit",
    reg_individual_price       : "Individuální cena",
    reg_individual_discount    : "Individuální sleva",
    reg_details                : "Info",
    
    pay_payment                : "Platba",
    pay_quick_cash             : "Hotovost",
    pay_tendered               : "Přijato",
    pay_total                  : "Celkem: ",
    pay_change                 : "Vráceno: ",
    pay_confirm                : "POTVRDIT PLATBU",    
    
    receipt_preview            : "Náhled účtenky",
    receipt_copy               : "Kopie účtenky",
    receipt_tin                : "IČO:",
    receipt_vat                : "DIČ:",
    receipt_receipt            : "Daňový doklad ",
    receipt_total_items        : "Počet položek:",
    receipt_subtotal           : "Mezisoučet:",
    receipt_round              : "Zaokrouhlení:",
    receipt_total_amount       : "Celkem:",
    receipt_tendered           : "Přijato:",
    receipt_change             : "Vráceno:",
    receipt_vat_summary        : "Přehled DPH",
    receipt_rate               : "Sazba",
    receipt_net                : "Netto",
    receipt_tax                : "DPH",
    receipt_total              : "Celkem",
    receipt_checked            : "Obsluha: ",
    
    pay_complete               : "Transakce dokončena!",
    pay_sync_failed            : "Tržba nebyla odeslána<br>Spadlo spojení",
    pay_issue_change           : "Vráceno ",
    pay_print_receipt          : "Vytisknout účtenku",
    pay_print_without_fik      : "Vytisknout účtenku bez FIK",
    pay_email_receipt          : "Odeslat mail",
    pay_done                   : "Hotovo",
    
    details_title              : "Informace o položce",  
    details_name               : "Název: ",  
    details_price              : "Cena: ",  
    details_group              : "Skupina: ",  
    details_tax                : "Sazba: ",  
    details_tags               : "Tagy: ",  
    details_description        : "Popis: ",
    
    settings_goback            : "Zpět",
    settings_sales_history     : "Historie prodejů",    
    settings_next_10_receipts  : "Dalších 10",
    settings_no_more_receipts  : "Již nejsou další",
    settings_close_register    : "Závěrka",
    settings_off_history       : "Neodeslané prodeje",
    settings_account           : "Nastavení účtu",
    settings_staff             : "Nastavení personálu",
    settings_pos               : "Nastavení pokladny",
    settings_per               : "Nastavení periferií",
    settings_plu               : "Editace PLU",
    settings_plu_links         : "Linkování PLU",
    settings_stock             : "Kontrola skladu",
    settings_sg                : "Editace zbožních skupin",
    settings_tabs              : "Editace záložek",
    settings_qs                : "Editace rychlých tlačítek",
    settings_receipt           : "Editace účtenky",
    
    form_label_change_password : "ZMĚNA HESLA",
    form_label_close_register  : "VYGENEROVAT DENNÍ ZÁVĚRKY",
    form_label_team            : "NASTAVENÍ TÝMU",
    form_label_receipt         : "ZMĚNA ÚČTENKY",
    form_label_pos             : "KONFIGURACE POKLADNY",
    form_label_per             : "KONFIGURACE PERIFERIÍ",
    form_label_catalog         : "ÚPRAVA KATALOGU",
    form_label_plu_links       : "ÚPRAVA PLU LINKOVÁNÍ",
    form_label_stock           : "SPRÁVA SKLADU",
    form_label_sg              : "ÚPRAVA ZBOŽNÍCH SKUPIN",
    form_label_tabs            : "ÚPRAVA ZÁLOŽEK",
    form_label_qs              : "ÚPRAVA RYCHLÝCH TLAČÍTEK",
    
    settings_save              : "Uložit",
    settings_saving            : "Ukládám",
    settings_saved             : "Uloženo",
    settings_remove            : "Odstranit",
    settings_removing          : "Odstranuji",
    settings_removed           : "Odstraněno",
    settings_failed            : "Nepodařilo se",
    
    history_number             : "ČÍSLO",
    history_date               : "DATUM A ČAS",
    history_employee           : "OBSLUHA",
    history_total              : "ZAPLACENO",
    history_confirmed          : "POTVRZENO",
    history_receipt            : "TISK",
    history_yes                : "ANO",
    history_no                 : "NE",
    history_print              : "Vytisknout účtenku",
    
    customer_display_name      : "Zákaznický displej",
    customer_display_welcome   : function () {return "***   Vítejte   ***\n    " + App.getDateOnly();},
    
    info_close_register        : "Tip: Vyberte den pro generování finanční zprávy",
    info_use_br                : "Tip: Použijte '&lt;br&gt;' jako nový řádek",
    info_import                : "Pozor: Import přepíše stávající katalog!",
    info_plu                   : "Tip: Nové PLU bude vyznačeno zeleně, existující modře",
    info_plu_links             : "Tip: Linkujte a vedlejší PLU s hlavním PLU pro společnou registraci. Např. u piv",
    info_stock                 : "Tip: Vyhledejte položku pomocí EAN kódu",
    info_tabs                  : "Pozor: Obsah odebrané záložky bude také smazán",
    info_qs                    : "Tip: Pro vytváření vložte EAN kód zboží",
    
    csv_invalid_nFields        : "Formát CSV hlavičky je neplatný. Nesprávný počet polí",
    csv_invalid_header         : function (i, headers, validHeaders) {return "Nesprávná CSV hlavička " + (i + 1) + ": " + headers[i] + ". Musí být " + validHeaders[i];},
    csv_invalid_nLine_values   : function (i, validLine) {return "Nesprávný formát na řádce " + (i + 1) + ". Musí mít " + validLine.length + " hodnot oddělených středníkem (;)";},
    csv_invalid_line_value     : function (i, header, currentValue) {return "Nesprávná hodnota na řádce: " + (i + 1) + ", sloupec: " + header + ", hodnota: " + (currentValue || "/prázdná/");},
    csv_must_unique            : function (nextItem, currentItem) {return "EAN kódy musí být unikátní! Našly se duplicitní EAN kódy na řádkách " + nextItem.lineNumber + " a " + currentItem.lineNumber;},
    csv_max_file_size          : "Soubor nemůže být větší než 3 MB",
    
    ph_search_ean              : "EAN kód",
    
    misc_incorrect_ep          : "Nesprávné uživatelské jméno nebo heslo",
    misc_network_error         : "Chyba sítě. Zkontrolujte internetové připojení",    
    misc_server_refused_to_sync: "Server odmítnul požadavek: ",
    misc_request_failed        : "Request failed: ",
    misc_reason                : "Příčina: ",
    misc_status                : "Status: ",
    misc_password_changed      : "Heslo změněno",
    misc_max_tabs              : "Nelze mít víc než 5 záložek",
    misc_enter_price           : "Nejdřív zadejte cenu",
    misc_plu_not_found         : "PLU neexistuje",
    misc_invalid_email         : "Neplatný e-mail",
    misc_old_password          : "STARÉ HESLO",
    misc_new_password          : "NOVÉ HESLO",
    misc_con_password          : "NOVÉ HESLO",
    misc_submit                : "ODESLAT",
    misc_passwords_not_match   : "Hesla se neshodují",
    misc_password_min_length   : "Minimální délka hesla je 8 znaků",
    misc_wrong_keyboard        : "Čtečka detekovala, že máte nesprávnou klávesnici. Prosím změňte jazyk klávesnice na anglický.<br>Můžete použít Alt+Shift",
    
    report_receipts            : "ÚČTENEK",
    report_takings             : "TRŽBY",
    report_net                 : "NETTO",
    report_vat                 : "DPH",
    report_total_vat           : "DPH",
    
    onbeforeunload             : "Opravdu si přejete zavřít aplikaci? Všechna neuložená data budou ztracena"
};


