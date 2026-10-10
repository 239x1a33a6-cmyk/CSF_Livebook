const PDFExtract = require('pdf.js-extract').PDFExtract;
const fs = require('fs');
const pdfExtract = new PDFExtract();

pdfExtract.extract('/Users/vinaykumar/Desktop/CSF_FIles/CS_Fundamentals_Interview_Syllabus_HighPriority.pdf', {}, (err, data) => {
    if (err) return console.error(err);
    let text = "";
    data.pages.forEach(page => {
        page.content.forEach(item => {
            text += item.str + " ";
        });
        text += "\n";
    });
    fs.writeFileSync(__dirname + '/../../syllabus.txt', text);
    console.log("Extraction complete!");
});
