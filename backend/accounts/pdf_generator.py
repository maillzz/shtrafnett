import asyncio
import os
import re
from playwright.async_api import async_playwright


def create_placeholder_regex_final(placeholder_text):
    """
    Создает regex, который ищет буквы плейсхолдера, игнорируя пробелы и HTML-теги.
    """
    condensed_text = placeholder_text.replace(' ', '')
    separator = r'(?:<[^>]*>| |\s)*?'
    pattern_parts = [re.escape(char) for char in condensed_text]
    regex_pattern = separator.join(pattern_parts)
    return regex_pattern


def prepare_html_final(template_path, data):
    """
    Загружает HTML-шаблон, заменяет плейсхолдеры данными и удаляет разрывы страниц.
    """
    with open(template_path, 'r', encoding='utf-8') as f:
        html_content = f.read()

    print("Замена плейсхолдеров...")

    placeholder_map = {
        '[Название районного суда]': 'court_name',
        '[Адрес суда]': 'court_address',
        '[Данные клиента: ФИО]': 'client_fio',
        '[Данные клиента: Адрес, номер телефона]': 'client_address_phone',
        '[ФИО контролера]': 'controller_fio',
        '[Номер дела]': 'case_number',
        '[Дата]': 'resolution_date',
        '[Дата и время нарушения]': 'violation_datetime',
        '[Номер парковки]': 'parking_lot_number',
        '[Адрес нарушения]': 'violation_address',
        '[Модель и номер автомобиля]': 'car_model_plate',
        '[Сумма штрафа]': 'fine_amount',
        '[Серийный номер]': 'device_serial',
        '[Номер свидетельства]': 'certificate_number',
        '[Дата подачи]': 'submission_date'
    }

    sorted_placeholders = sorted(placeholder_map.keys(), key=len, reverse=True)

    for placeholder in sorted_placeholders:
        key = placeholder_map[placeholder]
        if key in data:
            regex = create_placeholder_regex_final(placeholder)
            html_content = re.sub(regex, str(data[key]), html_content, flags=re.IGNORECASE)

    print("Удаление принудительных разрывов страниц...")
    page_break_pattern = r'<span[^>]*>\s*<br[^>]*page-break-before:always[^>]*>\s*</span>'
    html_content = re.sub(page_break_pattern, '', html_content, flags=re.IGNORECASE)

    return html_content


async def create_document_with_playwright(data, template_path="template.html", output_filename="output.pdf"):
    """
    Генерирует PDF-документ из HTML с помощью Playwright.
    """
    filled_html = prepare_html_final(template_path, data)

    print("Запуск headless-браузера...")
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        await page.set_content(filled_html, wait_until='domcontentloaded')

        print("Сохранение PDF...")
        await page.pdf(
            path=output_filename,
            format='A4',
            print_background=True
        )

        await browser.close()

    print(f"Документ сохранён: {output_filename}")
