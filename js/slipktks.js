function loadFonts() {
    const fonts = [
        new FontFace('BaacBold', 'url(assets/fonts/Baac_Bold.woff)')
    ];

    return Promise.all(fonts.map(font => font.load().catch(e => console.warn(e)))).then(function(loadedFonts) {
        loadedFonts.forEach(function(font) {
            if(font) document.fonts.add(font);
        });
    });
}

window.onload = function() {
    setCurrentDateTime();
    loadFonts().then(function() {
        document.fonts.ready.then(function() {
            updateDisplay(); 
        });
    }).catch(function() {
        updateDisplay();
    });
};

function setCurrentDateTime() {
    const now = new Date();
    const localDateTime = now.toLocaleString('sv-SE', { timeZone: 'Asia/Bangkok', hour12: false });
    const formattedDateTime = localDateTime.replace(' ', 'T');
    const dtElem = document.getElementById('datetime');
    if(dtElem && !dtElem.value) dtElem.value = formattedDateTime;
}

function formatDate(date) {
    if (!date || date === '-') return '-';
    const options = { day: 'numeric', month: 'short', year: '2-digit' };
    let formattedDate = new Date(date).toLocaleDateString('th-TH', options);
    formattedDate = formattedDate.replace(/ /g, ' ').replace(/\./g, '');
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const day = padZero(formattedDate.split(' ')[0]);
    const month = months[new Date(date).getMonth()];
    let year = formattedDate.split(' ')[2];
    year = `25${year}`;
    return `${day} ${month} ${year}`;
}

function generateUniqueID() {
    const prefix = "MTI00"; 
    const part1 = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0'); 
    const part2 = Math.floor(Math.random() * 100000000000).toString().padStart(11, '0'); 
    return `${prefix}${part1}${part2}`;
}

function padZero(num) {
    return num.toString().padStart(2, '0');
}

window.autoFormatAccount = function() {
    const bank = document.getElementById('bank')?.value;
    const accInput = document.getElementById('receiveraccount');
    
    if (!bank || !accInput) return;

    let rawVal = accInput.value.replace(/[^0-9]/g, '');
    if (rawVal.length === 0) return;

    if (bank === 'ออมสิน' || bank === 'ธ.ก.ส.' || rawVal.length === 12) {
        rawVal = rawVal.padStart(12, '0');
        accInput.value = `XXXXXXXX${rawVal.slice(-4)}`;
    } else {
        rawVal = rawVal.padStart(10, '0');
        accInput.value = `XXXXXX${rawVal.slice(-4)}`;
    }

    if (typeof updateDisplay === 'function') {
        updateDisplay();
    }
};

window.updateDisplay = async function() {
    const sendername = document.getElementById('sendername')?.value || '-';
    const senderaccount = document.getElementById('senderaccount')?.value || '-';
    const receivername = document.getElementById('receivername')?.value || '-';
    const receiveraccount = document.getElementById('receiveraccount')?.value || '-';
    const bank = document.getElementById('bank')?.value || '-';
    const amount11 = document.getElementById('amount11')?.value || '0.00';
    const datetime = document.getElementById('datetime')?.value || '-';
    
    const noteToggleElem = document.getElementById('modeSwitch');
    const isNoteMode = noteToggleElem ? noteToggleElem.checked : false;
    const AideMemoire = document.getElementById('AideMemoire') ? document.getElementById('AideMemoire').value : '-';
    const selectedImage = document.getElementById('imageSelect')?.value || '';

    const formattedDate = formatDate(datetime);
    let formattedTime = '';
    if (datetime && datetime !== '-') {
        const d = new Date(datetime);
        if (!isNaN(d.getTime())) formattedTime = d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    const canvas = document.getElementById('canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    canvas.width = 782;
    canvas.height = 1280;
    const backgroundImageSrc = isNoteMode ? 'assets/image/bs/A3T.jpg' : 'assets/image/bs/A3.jpg';

    const loadImage = (src) => new Promise(res => {
        if (!src) return res(null);
        const img = new Image();
        img.onload = () => res(img);
        img.onerror = () => res(null);
        img.src = src;
    });

    const [bgImg, customStickerImg] = await Promise.all([
        loadImage(backgroundImageSrc),
        loadImage((selectedImage && !selectedImage.includes('NO.png')) ? selectedImage : null)
    ]);

    if (bgImg) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = '#064e3b'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (isNoteMode) {
        drawText(ctx, `${formattedDate}  ${formattedTime}`, 391, 296.3, 39, 'BaacBold', '#4a4a4a', 'center', 50, 3, 0, 0, 800, 0);
        drawText(ctx, `รหัสทำรายการ  ${generateUniqueID()}`, 391, 334.8, 39, 'BaacBold', '#4a4a4a', 'center', 50, 3, 0, 0, 800, 0);

        drawText(ctx, `${sendername}`, 718.2, 415, 50, 'BaacBold', '#000000', 'right', 50, 3, 0, 0, 800, -0.50);
        drawText(ctx, `${senderaccount}`, 718.2, 463.3, 50, 'BaacBold', '#000000', 'right', 50, 1, 0, 0, 800, -0.50);
        
        drawText(ctx, `${bank}`, 718.2, 579, 50, 'BaacBold', '#000000', 'right', 50, 2, 0, 0, 800, 0);
        drawText(ctx, `${receivername}`, 718.2, 626.5, 50, 'BaacBold', '#000000', 'right', 50, 3, 0, 0, 800, -0.50);
        drawText(ctx, `${receiveraccount}`, 718.2, 672.2, 50, 'BaacBold', '#000000', 'right', 50, 1, 0, 0, 800, -0.50);
        
        drawText(ctx, `${AideMemoire}`, 718.2, 745, 50, 'BaacBold', '#000000', 'right', 50, 1, 0, 0, 800, -0.50);

        drawText(ctx, `${amount11} บาท`, 718.2, 835, 50, 'BaacBold', '#000000', 'right', 50, 3, 0, 0, 800, 0);
        drawText(ctx, `0.00 บาท`, 718.2, 906.4, 50, 'BaacBold', '#000000', 'right', 50, 3, 0, 0, 800, 0);
    } else {
        drawText(ctx, `${formattedDate}  ${formattedTime}`, 391, 296.3, 39, 'BaacBold', '#4a4a4a', 'center', 50, 3, 0, 0, 800, 0);
        drawText(ctx, `รหัสทำรายการ  ${generateUniqueID()}`, 391, 334.8, 39, 'BaacBold', '#4a4a4a', 'center', 50, 3, 0, 0, 800, 0);

        drawText(ctx, `${sendername}`, 718.2, 414.5, 50, 'BaacBold', '#000000', 'right', 50, 3, 0, 0, 800, -0.50);
        drawText(ctx, `${senderaccount}`, 718.2, 463.3, 50, 'BaacBold', '#000000', 'right', 50, 1, 0, 0, 800, -0.50);
        
        drawText(ctx, `${bank}`, 718.2, 579, 50, 'BaacBold', '#000000', 'right', 50, 2, 0, 0, 800, 0);
        drawText(ctx, `${receivername}`, 718.2, 626.5, 50, 'BaacBold', '#000000', 'right', 50, 3, 0, 0, 800, -0.50);
        drawText(ctx, `${receiveraccount}`, 718.2, 672.2, 50, 'BaacBold', '#000000', 'right', 50, 1, 0, 0, 800, -0.50);
        
        drawText(ctx, `${amount11} บาท`, 718.2, 765.6, 50, 'BaacBold', '#000000', 'right', 50, 3, 0, 0, 800, 0);
        drawText(ctx, `0.00 บาท`, 718.2, 835, 50, 'BaacBold', '#000000', 'right', 50, 3, 0, 0, 800, 0);
    }

    if (customStickerImg) {
        ctx.drawImage(customStickerImg, 0, 0, canvas.width, canvas.height); 
    }
};

function drawText(ctx, text, x, y, fontSize, fontFamily, color, align, lineHeight, maxLines, shadowColor, shadowBlur, maxWidth, letterSpacing) {
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.textAlign = 'left';
    ctx.shadowColor = shadowColor || 'transparent';
    ctx.shadowBlur = shadowBlur || 0;

    const paragraphs = text.split('<br>');
    let currentY = y;

    paragraphs.forEach(paragraph => {
        const segmenter = new Intl.Segmenter('th', { granularity: 'word' });
        const words = [...segmenter.segment(paragraph)].map(segment => segment.segment);

        let lines = [];
        let currentLine = '';

        words.forEach((word) => {
            const testLine = currentLine + word;
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width + (testLine.length - 1) * letterSpacing;

            if (testWidth > maxWidth && currentLine !== '') {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        });
        if (currentLine) {
            lines.push(currentLine);
        }

        lines.forEach((line, index) => {
            let currentX = x;

            if (align === 'center') {
                currentX = x - (ctx.measureText(line).width / 2) - ((line.length - 1) * letterSpacing) / 2;
            } else if (align === 'right') {
                currentX = x - ctx.measureText(line).width - ((line.length - 1) * letterSpacing);
            }

            drawTextLine(ctx, line, currentX, currentY, letterSpacing);
            currentY += lineHeight;
            if (maxLines && index >= maxLines - 1) {
                return;
            }
        });
        currentY += lineHeight;
    });
}

function drawTextLine(ctx, text, x, y, letterSpacing) {
    if (!letterSpacing) {
        ctx.fillText(text, x, y);
        return;
    }

    const segmenter = new Intl.Segmenter('th', { granularity: 'grapheme' });
    const characters = [...segmenter.segment(text)].map(segment => segment.segment);
    let currentPosition = x;

    characters.forEach((char, index) => {
        ctx.fillText(char, currentPosition, y);
        const charWidth = ctx.measureText(char).width;
        currentPosition += charWidth + letterSpacing;
    });
}

window.downloadImage = function() {
    const canvas = document.getElementById('canvas');
    if(!canvas) return;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'baac_slip.png';
    link.click();
};

const generateBtn = document.getElementById('generate');
if(generateBtn) generateBtn.addEventListener('click', updateDisplay);