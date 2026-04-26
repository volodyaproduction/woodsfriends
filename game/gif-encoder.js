/*
 * gif-encoder.js — animated GIF encoder (без зависимостей)
 *
 * Экспортирует: window.encodeAnimatedGIF(frames, W, H, delayMs)
 *
 * frames  — массив Uint8Array, каждый кадр W×H индексов палитры:
 *   0 = сетка (#252545)
 *   1 = мёртвая клетка (#1a1a2e)
 *   2 = живая клетка (#7EC87E)
 * W, H    — размеры кадра в пикселях
 * delayMs — задержка между кадрами (мс)
 * Возвращает Uint8Array — байты готового GIF файла.
 */

(function() {

  // 1. LZW кодирование (GIF LSB-first)
  function lzwEncode(pixels, minSize) {
    var clearCode = 1 << minSize;   // 4
    var eofCode   = clearCode + 1;  // 5
    var codeSize, nextCode, table;

    // 1a. Сброс таблицы кодов
    function reset() {
      table    = {};
      codeSize = minSize + 1;
      nextCode = eofCode + 1;
    }

    // 1b. Битовый буфер (LSB-first, как требует GIF)
    var buf = 0, bits = 0, out = [];

    function writeCode(code) {
      buf  |= code << bits;
      bits += codeSize;
      while (bits >= 8) {
        out.push(buf & 0xFF);
        buf   = (buf >>> 8) & 0xFFFFFF;
        bits -= 8;
      }
    }

    // 1c. Основной цикл кодирования
    reset();
    writeCode(clearCode);

    var prefix = pixels[0];
    for (var i = 1; i < pixels.length; i++) {
      var c   = pixels[i];
      var key = prefix + '|' + c;

      if (table[key] !== undefined) {
        prefix = table[key];
      } else {
        writeCode(prefix);
        if (nextCode < 4096) {
          table[key] = nextCode++;
          if (nextCode > (1 << codeSize) && codeSize < 12) {
            codeSize++;
          }
        } else {
          // 1d. Таблица заполнена — сброс
          writeCode(clearCode);
          reset();
        }
        prefix = c;
      }
    }

    writeCode(prefix);
    writeCode(eofCode);

    // 1e. Остаток буфера
    if (bits > 0) out.push(buf & 0xFF);

    return out;
  }

  // 2. Сборка animated GIF из кадров
  function encodeAnimatedGIF(frames, W, H, delayMs) {
    var MIN_CODE = 2;  // log2(4 цвета) = 2
    var delay    = Math.round(delayMs / 10);  // единицы по 10 мс
    var out      = [];

    // 2a. 16-bit little-endian
    function w16(v) {
      out.push(v & 0xFF, (v >> 8) & 0xFF);
    }

    // 2b. Header "GIF89a"
    out.push(71, 73, 70, 56, 57, 97);

    // 2c. Logical Screen Descriptor
    w16(W); w16(H);
    // GCT=1, color_res=0, sort=0, GCT_size=1 (2^2 = 4 цвета)
    out.push(0x81, 0, 0);

    // 2d. Global Color Table (4 цвета × 3 байта)
    out.push(
      0x25, 0x25, 0x45,  // 0: сетка
      0x1a, 0x1a, 0x2e,  // 1: мёртвая
      0x7E, 0xC8, 0x7E,  // 2: живая
      0x00, 0x00, 0x00   // 3: padding
    );

    // 2e. Netscape Application Extension (бесконечный цикл)
    out.push(
      0x21, 0xFF, 0x0B,
      0x4E, 0x45, 0x54, 0x53, 0x43,
      0x41, 0x50, 0x45, 0x32, 0x2E, 0x30,  // "NETSCAPE2.0"
      0x03, 0x01, 0x00, 0x00,
      0x00
    );

    // 2f. Кадры
    for (var f = 0; f < frames.length; f++) {

      // Graphic Control Extension
      out.push(0x21, 0xF9, 0x04, 0x00);
      w16(delay);
      out.push(0x00, 0x00);

      // Image Descriptor
      out.push(0x2C);
      w16(0); w16(0); w16(W); w16(H);
      out.push(0x00);

      // LZW Image Data, разбитые на блоки по 255 байт
      var lzw = lzwEncode(frames[f], MIN_CODE);
      out.push(MIN_CODE);
      var i = 0;
      while (i < lzw.length) {
        var blen = Math.min(255, lzw.length - i);
        out.push(blen);
        for (var j = 0; j < blen; j++) out.push(lzw[i++]);
      }
      out.push(0x00);  // block terminator
    }

    // 2g. Trailer
    out.push(0x3B);

    return new Uint8Array(out);
  }

  window.encodeAnimatedGIF = encodeAnimatedGIF;

})();
