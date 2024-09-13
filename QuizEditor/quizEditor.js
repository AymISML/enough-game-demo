let quizData = { stage01: [], stage02: [], stage03: [] };
let collapseState = {};  // To store the collapsed/expanded state

function renderQuiz() {
    const editorDiv = document.getElementById('editor');
    editorDiv.innerHTML = '';

    Object.keys(quizData).forEach((stageKey, stageIndex) => {
        const stageDiv = document.createElement('div');
        stageDiv.className = 'stage';

        if (collapseState[stageKey] === undefined)
            collapseState[stageKey] = { expanded: false };

        // Check if this stage is collapsed or expanded
        const isExpanded = collapseState[stageKey] && collapseState[stageKey].expanded;

        stageDiv.classList.toggle('expanded', isExpanded);
        stageDiv.innerHTML = `
            <h2 class="toggle-header">Stage ${stageIndex + 1} <span class="toggle-icon">${isExpanded ? '-' : '+'}</span></h2>
            <div class="collapsible-content">
            </div>
        `;

        quizData[stageKey].forEach((question, questionIndex) => {
            const questionDiv = document.createElement('div');
            const isQuestionExpanded = collapseState[stageKey] && collapseState[stageKey][`question${questionIndex}`];
            questionDiv.className = 'question';
            questionDiv.classList.toggle('expanded', isQuestionExpanded);
            questionDiv.innerHTML = `
                <h3 class="toggle-header">Question ${questionIndex + 1} <span class="toggle-icon">${isQuestionExpanded ? '-' : '+'}</span></h3>
                <div class="collapsible-content">
                    <textarea onchange="updateQuestion('${stageKey}', ${questionIndex}, 'Question', this.value)">${question.Question}</textarea>
                </div>
            `;

            question.Answers.forEach((answer, answerIndex) => {
                const answerDiv = document.createElement('div');
                answerDiv.className = 'answer';
                answerDiv.innerHTML = `
                    <h4>Answer ${answerIndex + 1}</h4>
                    <textarea onchange="updateAnswer('${stageKey}', ${questionIndex}, ${answerIndex}, 'Text', this.value)">${answer.Text}</textarea>
                    <textarea onchange="updateAnswer('${stageKey}', ${questionIndex}, ${answerIndex}, 'Note', this.value)">${answer.Note}</textarea>
                    <button class="remove-btn" onclick="removeAnswer('${stageKey}', ${questionIndex}, ${answerIndex})">Remove Answer</button>
                `;
                questionDiv.querySelector('.collapsible-content').appendChild(answerDiv);
            });

            const addAnswerButton = document.createElement('button');
            addAnswerButton.onclick = function () {
                addAnswer(stageKey, questionIndex);
            };
            addAnswerButton.innerHTML = 'Add Answer';

            const removeQuestionButton = document.createElement('button');
            removeQuestionButton.className = 'remove-btn';
            removeQuestionButton.onclick = function () {
                removeQuestion(stageKey, questionIndex);
            };
            removeQuestionButton.innerHTML = 'Remove Question';
            
            questionDiv.querySelector('.collapsible-content').appendChild(addAnswerButton);
            questionDiv.querySelector('.collapsible-content').appendChild(removeQuestionButton);
            stageDiv.querySelector('.collapsible-content').appendChild(questionDiv);
        });

        const addQuestionButton = document.createElement('button');
        addQuestionButton.onclick = function () {
            addQuestion(stageKey);
        };
        addQuestionButton.innerHTML = 'Add Question';
        stageDiv.querySelector('.collapsible-content').appendChild(addQuestionButton);
        editorDiv.appendChild(stageDiv);
    });
}

function addQuestion(stageKey) {
    quizData[stageKey].push({ Question: '', Answers: [] });
    collapseState[stageKey].expanded = true;
    collapseState[stageKey][`question${quizData[stageKey].length - 1}`] = true;
    renderQuiz();
}

function addAnswer(stageKey, questionIndex) {
    quizData[stageKey][questionIndex].Answers.push({ Text: '', Note: '' });
    collapseState[stageKey][`question${questionIndex}`] = true;
    renderQuiz();
}

function removeQuestion(stageKey, questionIndex) {
    quizData[stageKey].splice(questionIndex, 1);
    renderQuiz();
}

function removeAnswer(stageKey, questionIndex, answerIndex) {
    quizData[stageKey][questionIndex].Answers.splice(answerIndex, 1);
    renderQuiz();
}

function updateQuestion(stageKey, questionIndex, field, value) {
    quizData[stageKey][questionIndex][field] = value;
}

function updateAnswer(stageKey, questionIndex, answerIndex, field, value) {
    quizData[stageKey][questionIndex].Answers[answerIndex][field] = value;
}

async function exportJSON() {
    try {
        // Use File System Access API to show a save file picker
        const options = {
            suggestedName: 'quiz_data.json',
            types: [{
                description: 'JSON Files',
                accept: { 'application/json': ['.json'] }
            }]
        };

        const handle = await window.showSaveFilePicker(options);
        const writable = await handle.createWritable();

        // Write the JSON data to the file
        const data = JSON.stringify(quizData, null, 2);
        await writable.write(new Blob([data], { type: 'application/json' }));

        // Close the file
        await writable.close();
        alert('File saved successfully!');
    } catch (err) {
        console.error("Error saving file:", err);
    }
}

function importJSON(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
        quizData = JSON.parse(e.target.result);
        renderQuiz();
    };
    reader.readAsText(file);
}

// Save collapsed state
function saveCollapseState(stageDiv) {
    const stageKey = Object.keys(quizData)[Array.from(stageDiv.parentElement.children).indexOf(stageDiv)];
    const isExpanded = stageDiv.classList.contains('expanded');
    collapseState[stageKey] = { expanded: isExpanded };

    const questionDivs = stageDiv.querySelectorAll('.question');
    questionDivs.forEach((questionDiv, questionIndex) => {
        const isQuestionExpanded = questionDiv.classList.contains('expanded');
        collapseState[stageKey][`question${questionIndex}`] = isQuestionExpanded;
    });
}

// Initial render
renderQuiz();
