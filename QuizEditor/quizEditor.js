let quizData = { stage01: [], stage02: [], stage03: [] };
let collapseState = {};
let hasUnsavedChanges = false;

const langList = { en: 'English', fr: 'French', es: 'Spanish' };
const pathwaysList = ['Afghanistan', 'Canada', 'Laos', 'Mali', 'Peru', 'Philippines', 'Spain', 'Zambia'];

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
                    <textarea placeholder="Question text" onchange="updateQuestion('${stageKey}', ${questionIndex}, 'Question', this.value)">${question.Question}</textarea>
                </div>
            `;

            question.Answers.forEach((answer, answerIndex) => {
                const answerDiv = document.createElement('div');
                answerDiv.className = 'answer';
                answerDiv.innerHTML = `
                    <h4>Answer ${answerIndex + 1}</h4>
                    <textarea placeholder="Answer text" onchange="updateAnswer('${stageKey}', ${questionIndex}, ${answerIndex}, 'Text', this.value)">${answer.Text}</textarea>
                    <textarea placeholder="Answer note" onchange="updateAnswer('${stageKey}', ${questionIndex}, ${answerIndex}, 'Note', this.value)">${answer.Note}</textarea>
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
    setUnsavedChanges(true);
    renderQuiz();
}

function addAnswer(stageKey, questionIndex) {
    quizData[stageKey][questionIndex].Answers.push({ Text: '', Note: '' });
    collapseState[stageKey][`question${questionIndex}`] = true;
    setUnsavedChanges(true);
    renderQuiz();
}

function removeQuestion(stageKey, questionIndex) {
    if(!confirm('Are you sure you want to remove this question?'))
        return;

    quizData[stageKey].splice(questionIndex, 1);
    setUnsavedChanges(true);
    renderQuiz();
}

function removeAnswer(stageKey, questionIndex, answerIndex) {
    if(!confirm('Are you sure you want to remove this answer?'))
        return;

    quizData[stageKey][questionIndex].Answers.splice(answerIndex, 1);
    setUnsavedChanges(true);
    renderQuiz();
}

function updateQuestion(stageKey, questionIndex, field, value) {
    quizData[stageKey][questionIndex][field] = value;
    setUnsavedChanges(true);
}

function updateAnswer(stageKey, questionIndex, answerIndex, field, value) {
    quizData[stageKey][questionIndex].Answers[answerIndex][field] = value;
    setUnsavedChanges(true);
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

function showLoadingOverlay() {
    document.getElementById('loading-overlay').style.display = 'block';
}

function hideLoadingOverlay() {
    document.getElementById('loading-overlay').style.display = 'none';
}

function setUnsavedChanges(value) {
    hasUnsavedChanges = value;
    updateNotificationBar();
    updateSaveLoadButtons();
}

function updateNotificationBar() {
    const notificationBar = document.getElementById('notification-bar');
    notificationBar.style.display = hasUnsavedChanges ? 'block' : 'none';
}

function updateSaveLoadButtons() {
    // const loadButton = document.querySelector('button[onclick="loadQuiz()"]');
    // loadButton.disabled = hasUnsavedChanges;
    const saveButton = document.querySelector('button[onclick="saveQuiz()"]');
    if (saveButton === null || saveButton.undefined)
        return;

    saveButton.disabled = !hasUnsavedChanges;
}

function updateBreadcrumbs() {
    const url = new URL(window.location.origin + window.location.pathname);

    let breadcrumbsHTML = `<a href=${url}>Home</a>`;
    const searchParams = new URLSearchParams(window.location.search);

    if (searchParams.has('pathway')) {
        url.searchParams.append('pathway', searchParams.get('pathway'));
        breadcrumbsHTML += '<span>></span>';
        breadcrumbsHTML += `<a href=${url}>${searchParams.get('pathway')}</a>`;

        if (searchParams.has('lang')) {
            breadcrumbsHTML += '<span>></span>';
            breadcrumbsHTML += `<a href="#">${langList[searchParams.get('lang')]}</a>`;
        }
    }

    const breadcrumbsDiv = document.getElementById('breadcrumbs');
    breadcrumbsDiv.innerHTML = breadcrumbsHTML;
}

async function loadQuiz() {
    if (hasUnsavedChanges && !confirm('You have unsaved changes. Are you sure you want to load a new quiz? All unsaved changes will be lost.')) {
        return;
    }

    let dbPath = 'https://enough-wv-default-rtdb.europe-west1.firebasedatabase.app/pathways';
    const searchParams = new URLSearchParams(window.location.search);

    if (searchParams.has('pathway')) {
        dbPath += `/${searchParams.get('pathway')}`;
        if (searchParams.has('lang')) {
            dbPath += `/${searchParams.get('lang')}.json`;

            showLoadingOverlay();
            try {
                const response = await fetch(dbPath, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const loadedJSON = await response.json();
                if (loadedJSON === null || loadedJSON === undefined) {
                    throw new Error(`Quiz not found in db`);
                }

                if (loadedJSON['stage01'] === undefined)
                    loadedJSON['stage01'] = [];

                if (loadedJSON['stage02'] === undefined)
                    loadedJSON['stage02'] = [];

                if (loadedJSON['stage03'] === undefined)
                    loadedJSON['stage03'] = [];

                quizData = loadedJSON;
                setUnsavedChanges(false);
                renderQuiz();
                return;
            } catch (error) {
                console.error("Error loading quiz:", error);
                alert("Requested quiz wasn't found! create new one.");
            } finally {
                hideLoadingOverlay();
            }
        }
    }

    quizData = { stage01: [], stage02: [], stage03: [] };
    setUnsavedChanges(false);
    renderQuiz();
}

async function saveQuiz() {
    const searchParams = new URLSearchParams(window.location.search);
    let dbPath = 'https://enough-wv-default-rtdb.europe-west1.firebasedatabase.app/pathways';
    dbPath += `/${searchParams.get('pathway')}`;
    dbPath += `/${searchParams.get('lang')}.json`;

    showLoadingOverlay();
    try {
        const response = await fetch(dbPath, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(quizData)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        setUnsavedChanges(false);
        alert('Quiz saved successfully!');
    } catch (error) {
        console.error("Error saving quiz:", error);
        alert("Failed to save quiz. Please try again.");
    } finally {
        hideLoadingOverlay();
    }
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

// Add event listener for page unload
window.addEventListener('beforeunload', function (e) {
    if (hasUnsavedChanges) {
        e.preventDefault(); // Cancel the event
        e.returnValue = ''; // Display a default message in the browser
    }
});

function RenderPage() {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.has('pathway')) {
        if (searchParams.has('lang')) {
            renderQuizPage();
            return;
        }

        renderLanguagesPage();
        return;
    }

    renderHomePage();
}

function renderHomePage() {
    const pathwaySelectorDiv = document.createElement('div');
    pathwaySelectorDiv.id = "pathway-selector";
    document.body.appendChild(pathwaySelectorDiv);

    for (const pathway of pathwaysList) {
        const url = new URL(window.location.origin + window.location.pathname);
        url.searchParams.append('pathway', pathway.toLowerCase());

        const pathwayCard = document.createElement('div');
        pathwayCard.innerHTML = `<h1>${pathway}</h>`;
        pathwayCard.className = "card";
        pathwayCard.onclick = function () {
            location.href = url;
        };

        pathwaySelectorDiv.appendChild(pathwayCard);
    }
}

function renderLanguagesPage() {
    const pathwaySelectorDiv = document.createElement('div');
    pathwaySelectorDiv.id = "pathway-selector";
    document.body.appendChild(pathwaySelectorDiv);

    for (const lang in langList) {
        const url = new URL(window.location.href);
        url.searchParams.append('lang', lang.toLowerCase());

        const pathwayCard = document.createElement('div');
        pathwayCard.innerHTML = `<h1>${langList[lang]}</h>`;
        pathwayCard.className = "card";
        pathwayCard.onclick = function () {
            location.href = url;
        };

        pathwaySelectorDiv.appendChild(pathwayCard);
    }
}

function renderQuizPage(){
    const editorDiv = document.createElement('div');
    editorDiv.id = "editor";
    editorDiv.innerHTML = '';
    document.body.appendChild(editorDiv);

    const actionButtonsDiv = document.createElement('div');
    actionButtonsDiv.className = "action-buttons";
    actionButtonsDiv.innerHTML = `<button onclick="saveQuiz()">Save</button>`;
    document.body.appendChild(actionButtonsDiv);

    loadQuiz();
}

// Initial render
RenderPage();
updateNotificationBar();
updateSaveLoadButtons();
updateBreadcrumbs();