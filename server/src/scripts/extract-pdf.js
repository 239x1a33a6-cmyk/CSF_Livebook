const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('/Users/vinaykumar/Desktop/CSF_FIles/CS_Fundamentals_Interview_Syllabus_HighPriority.pdf');

const parse = pdf.default || pdf;
parse(dataBuffer).then(function(data) {
    fs.writeFileSync(__dirname + '/../../syllabus.txt', data.text);
    console.log("PDF extraction complete! Saved to syllabus.txt");
    console.log("Number of pages: ", data.numpages);
}).catch(function(error) {
    console.error("Error reading PDF: ", error);
});
