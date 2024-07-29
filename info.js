// Name:        Muhammad Aril Bin Mohamed Irwan
// Class:       DIT/1B/07
// Admin No:    2323275

// #############################################################################################################################################
// LOAD DATA
// #############################################################################################################################################

// Function to fetch data for a specific year
function getDataByYear(year) {
    return new Promise((resolve, reject) => {
        const url = 'http://localhost:8081/year/' + year;
        fetch(url)
            .then(response => response.json())
            .then(function (data) {
                resolve(data);
            })
            .catch(error => reject(error)); // Catch any errors during fetch
    });
}

// Function to fetch data for a specific university and year
function getDataByCodeAndYear(uniCode, year) {
    return new Promise((resolve, reject) => {
        const url = 'http://localhost:8081/university/' + uniCode + '/year/' + year;
        fetch(url)
            .then(response => response.json())
            .then(function (data) {
                resolve(data);
            })
            .catch(error => reject(error)); // Catch any errors during fetch
    });
}

// Function to fetch all universities
function getAllUni() {
    return new Promise((resolve, reject) => {
        fetch('http://localhost:8081/university')
            .then(response => response.json())
            .then(function (data) {
                resolve(data);
            })
            .catch(error => reject(error)); // Catch any errors during fetch
    });
}

// #############################################################################################################################################
// EVENT LISTENERS FOR FRONT-END COMMUNICATION
// #############################################################################################################################################

// Event listener for DOMContentLoaded
document.addEventListener('DOMContentLoaded', async () => {
    // Selecting elements from the DOM
    const submitYear = document.getElementById('submitYear');
    const submitYearAndUni = document.getElementById('submitYearAndUni');
    const yearInputSalary = document.getElementById('yearInputSalary');
    const yearInputEmployment = document.getElementById('yearInputEmployment');
    const universitySelectBox = document.getElementById('universitySelectBox');
    const salaryDisplay = document.getElementById('salaryDisplay');
    const employmentDisplay = document.getElementById('employmentDisplay');
    const errorContainer = document.getElementById('errorContainer');

    // Event listener for clicking on the submit button for salary
    submitYear.addEventListener('click', async () => {
        // Getting input value for year
        const year = yearInputSalary.value;
        // Validating input
        if (!year) {
            displayError("Please enter a year.");
            return;
        }

        try {
            // Display top 10 degrees by salary
            const resultHTMLSalary = await displayTop10DegreesBySalary(year);
            salaryDisplay.updateContent(resultHTMLSalary);
        } catch (error) {
            console.error('Error updating content:', error);
            displayError('Error updating content: ' + error.message);
        }
    });

    // Event listener for clicking on the submit button for employment
    submitYearAndUni.addEventListener('click', async () => {
        // Getting input values for year and university code
        const year = yearInputEmployment.value;
        const selectedUniversityCode = universitySelectBox.value;
        // Validating input
        if (!year) {
            displayError("Please enter a year.");
            return;
        }

        try {
            // Display overall employment rate for the selected university and year
            const resultHTMLEmployment = await displayFullTimeEmploymentRateSummary(selectedUniversityCode, year);
            employmentDisplay.updateContent(resultHTMLEmployment);
        } catch (error) {
            console.error('Error displaying overall employment rate:', error);
            displayError('Error displaying overall employment rate: ' + error.message);
        }
    });

    // Event listener for inputValid event of the text boxes
    yearInputSalary.addEventListener('inputValid', (event) => {
        submitYear.disabled = !event.detail;
    });

    yearInputEmployment.addEventListener('inputValid', (event) => {
        submitYearAndUni.disabled = !event.detail;
    });

    // Event listeners for year input fields to hide error message when input is valid
    yearInputSalary.addEventListener('input', () => {
        if (yearInputSalary.value) {
            hideError();
        }
    });

    yearInputEmployment.addEventListener('input', () => {
        if (yearInputEmployment.value) {
            hideError();
        }
    });

    // Function to hide error message
    function hideError() {
        errorContainer.style.display = 'none';
    }
});

// #############################################################################################################################################
// ASYNC FUNCTIONS TO SORT, CALCULATE, AND ORGANISE DATA
// #############################################################################################################################################

// Function to display top 10 degrees by salary for a specific year
async function displayTop10DegreesBySalary(year) {
    let resultHTML = '';

    try {
        // Fetch data for the specified year
        const data = await getDataByYear(year);

        // Check if there is data for the specified year
        if (data.length === 0) {
            console.error('No data available for the year ' + year);
            // If no data is available, add error message to resultHTML and return
            resultHTML += `<h3>No data available for the year ${year}</h3>`;
            return resultHTML;
        } else {
            // Sort data by Basic Monthly Salary - Median in descending order
            const sortedData = data.slice().sort((a, b) => b.basic_monthly_median - a.basic_monthly_median);

            // Display the top 10 degrees with the highest Basic Monthly Salary - Median
            resultHTML += '<h3>Top 10 Degrees with highest "Basic Monthly Salary - Median (S$)" in ' + year + ':</h3>';
            sortedData.slice(0, 10).forEach((entry, index) => {
                // Generate HTML for each entry with border, shadow, padding, and margin
                resultHTML += `
                    <div style="border: 1px solid; box-shadow: 3px 3px 5px rgba(0, 0, 0, 0.5); padding: 10px; margin-bottom: 10px;">
                        <p>
                            <strong>Rank: ${index + 1}</strong><br>
                            University: ${entry.university}<br>
                            School: ${entry.school}<br>
                            Degree: ${entry.degree}<br>
                            Median Salary: $${entry.basic_monthly_median.toFixed(2)}
                        <p>
                    </div>
                `;
            });
            return resultHTML; // Return the generated HTML
        }
    } catch (error) {
        // Handle errors
        console.error('Error displaying top 10 degrees:', error);
        // Add error message to resultHTML and return
        resultHTML += 'Error displaying top 10 degrees: ' + error.message;
        return resultHTML;
    }
}

// Function to display full-time employment rate for a specific university and year
async function displayFullTimeEmploymentRateSummary(code, year) {
    let resultHTML = '';

    try {
        // Fetch data from the server based on user input
        const data = await getDataByCodeAndYear(code, year);

        // Check if there is data for the specified university
        if (data.length === 0) {
            console.error('No data available for ' + code + ' in ' + year);
            // If no data is available, add error message to resultHTML and return
            resultHTML += `<h3>No data available for ${code} in the year ${year}</h3>`;
            return resultHTML;
        }

        // Organize filtered data by school and degree
        const organizedData = organizeDataBySchoolAndDegree(data);

        // Display the summary of Full-Time Permanent Employment Rate
        resultHTML += '<h3>Full Time Permanent Employment Rate Summary for ' + code + ' in ' + year + ':</h3>';

        // Iterate over organized data
        organizedData.forEach((degrees, school) => {
            // Start a container for each school with border, shadow, padding, and margin
            resultHTML += `
                <div style="border: 1px solid; box-shadow: 3px 3px 5px rgba(0, 0, 0, 0.5); padding: 10px; margin-bottom: 10px;">
                    <h4>${school}</h4>
            `;
            // Iterate over degrees for the current school
            degrees.forEach(entry => {
                // Add horizontal line and degree information
                resultHTML += `
                    <hr><p>Degree: ${entry.degree}<br>
                `;
                // Iterate over employment rates for the current degree
                entry.years.forEach(yearEntry => {
                    // Add employment rate information
                    resultHTML += `
                        Full Time Employment Rate: ${yearEntry.employmentRate}%</p>
                    `;
                });
            });
            // Close the container for the current school
            resultHTML += `</div>`;
        });

        return resultHTML; // Return the generated HTML

    } catch (error) {
        // Handle errors
        console.error('Error displaying Full-Time Permanent Employment Rate summary:', error);
        // Add error message to resultHTML and return
        resultHTML += 'Error displaying Full-Time Permanent Employment Rate summary:' + error.message;
        return resultHTML;
    }
}

// Function to fetch all universities and display in the select box
async function showAllUniversities(selectBox) {

    try {
        const universities = await getAllUni();

        universities.forEach(university => {
            var option = document.createElement("option");
            option.text = university.name;
            option.value = university.code;
            selectBox.add(option);
        });

    } catch (error) {
        console.error('Error loading universities:', error);
    }
}

// #############################################################################################################################################
// UTILITY FUNCTIONS
// #############################################################################################################################################

// Utility function to organize data by school and degree
function organizeDataBySchoolAndDegree(data) {
    const organizedData = new Map();

    data.forEach(entry => {
        const school = entry.school;
        const degree = entry.degree;
        const year = entry.year;
        const employmentRate = entry.employment_rate_ft_perm;

        if (!organizedData.has(school)) {
            organizedData.set(school, []);
        }

        const schoolData = organizedData.get(school);
        const existingEntry = schoolData.find(entry => entry.degree === degree);

        if (existingEntry) {
            existingEntry.years.push({ year: year, employmentRate: employmentRate });
        } else {
            schoolData.push({
                degree: degree,
                years: [{ year: year, employmentRate: employmentRate }],
            });
        }
    });

    organizedData.forEach(degrees => {
        degrees.sort((a, b) => a.degree.localeCompare(b.degree));
    });

    return organizedData;
}

// Utility function to display error messages
function displayError(message) {
    const errorContainer = document.getElementById('errorContainer');
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorContainer.style.display = 'block';
}

// #############################################################################################################################################
// WEB COMPONENTS
// #############################################################################################################################################

// Custom text box component
const textbox_template = document.createElement('template');
textbox_template.innerHTML = `
    <style>
        :host {
            display : block;
        }
        input {
            width: 100px;
            height: 30px
        }
        #error-message {
            color: red;
            display: none;
        }    
    </style>
    <input /><span id="error-message">Invalid input. Enter a year</span>
`;
class ValidTextBox extends HTMLElement {
    constructor() {
        super();
        this.root = this.attachShadow({ mode: "closed" });
        let clone = textbox_template.content.cloneNode(true);
        this.root.appendChild(clone);
        this.root.querySelector('input').addEventListener("input", (ev) => {
            this.validateInput();
        });
    }

    static get observedAttributes() {
        return ['validtype'];
    }

    get validtype() {
        return this.getAttribute('validtype');
    }
    set validtype(value) {
        this.setAttribute('validtype', value);
    }

    get value() {
        let textbox = this.root.querySelector("input");
        return textbox.value;
    }
    set value(newValue) {
        let textbox = this.root.querySelector("input");
        textbox.value = newValue;
    }

    validateInput() {
        const errorMessage = this.root.querySelector('#error-message');
        const inputValue = this.value;

        let isValid = true;
        if (inputValue.length > 0) {
            switch (this.validtype) {
                case "number":
                    isValid = /^[0-9]+$/.test(inputValue);
                    break;
            }
        }
        if (isValid) {
            errorMessage.style.display = 'none';
            this.dispatchEvent(new CustomEvent('inputValid', { detail: true }));
        } else {
            errorMessage.style.display = 'block';
            this.dispatchEvent(new CustomEvent('inputValid', { detail: false }));
        }
    }
}
customElements.define("valid-textbox", ValidTextBox);


// Custom submit button component
class CustomButton extends HTMLButtonElement {
    constructor() {
        super();
        this.textContent = this.getAttribute('text') || 'Submit';
        this.style.backgroundColor = this.getAttribute('color') || 'light';
        this.style.color = 'black';
        this.style.padding = '4px';
        this.style.borderRadius = '5px';
    }
}
customElements.define('custom-button', CustomButton, { extends: "button" });


// Custom display data component
class DisplayData extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    updateContent(htmlContent) {
        this.shadowRoot.innerHTML = htmlContent;
    }
}
customElements.define('display-data', DisplayData);


// Custom select box component
class SelectBox extends HTMLSelectElement {
    constructor() {
        super();
        showAllUniversities(this);
    }

    attributeChangedCallback(property, oldValue, newValue) {
        if (oldValue === newValue)
            return;
        this[property] = newValue;
    }

    connectedCallback() {
        console.log("connectedCallback triggered")
    }
}
customElements.define("select-box", SelectBox, { extends: "select" });
