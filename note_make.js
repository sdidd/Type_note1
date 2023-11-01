// Import the AWS SDK for JavaScript
const AWS = require('aws-sdk');

// Configure AWS with your region
AWS.config.update({ region: 'eu-north-1' }); // Replace 'your-region' with your AWS region.

// Initialize the DynamoDB Document Client
const dynamoDB = new AWS.DynamoDB.DocumentClient();

// Function to add a note to DynamoDB
function addNoteToDynamoDB(noteText) {
    const params = {
        TableName: 'NotesTable', // Replace 'YourTableName' with your DynamoDB table name
        Item: {
            NoteID: Date.now().toString(),
            NoteText: noteText,
        }
    };

    dynamoDB.put(params, function(err, data) {
        if (err) {
            console.error("Unable to add note. Error:", err);
        } else {
            console.log("Note added successfully.");
            showNotes(); // Call your showNotes function to refresh the UI.
        }
    });
}

// Function to fetch notes from DynamoDB (modify your showNotes function to use DynamoDB instead of local storage)
function fetchNotesFromDynamoDB() {
    const params = {
        TableName: 'NotesTable' // Replace 'YourTableName' with your DynamoDB table name
    };

    dynamoDB.scan(params, function(err, data) {
        if (err) {
            console.error("Unable to fetch notes. Error:", err);
        } else {
            console.log("Notes fetched successfully.");
            // Process the data and update your UI.
            let html = "";
            data.Items.forEach(function(item, index) {
                html += `
                    <div class="noteCard my-2 mx-2 card" style="width: 18rem;">
                        <div class="card-body">
                            <h5 class="card-title">Note ${index + 1}</h5>
                            <p class="card-text"> ${item.NoteText}</p>
                            <button id="${item.NoteID}" onclick="deleteNote(this.id)" class="btn btn-primary">Delete Note</button>
                        </div>
                    </div>`;
            });
            let notesElm = document.getElementById("notes");
            if (data.Items.length !== 0) {
                notesElm.innerHTML = html;
            } else {
                notesElm.innerHTML = `Nothing to show! Use "Add a Note" section above to add notes.`;
            }
        }
    });
}

// Function to show elements from DynamoDB
function showNotes() {
    fetchNotesFromDynamoDB(); // Fetch notes from DynamoDB
}

// Your existing addBtn event listener can remain here
let addBtn = document.getElementById("addBtn");
addBtn.addEventListener("click", function(e) {
    let addTxt = document.getElementById("addTxt").value;
    addNoteToDynamoDB(addTxt);
    document.getElementById("addTxt").value = ""; // Clear the input field
});

// Your existing deleteNote function can remain here
function deleteNote(index) {
    //   console.log("I am deleting", index);

    let notes = localStorage.getItem("notes");
    if (notes == null) {
        notesObj = [];
    } else {
        notesObj = JSON.parse(notes);
    }

    notesObj.splice(index, 1);
    localStorage.setItem("notes", JSON.stringify(notesObj));
    showNotes();
}

let search = document.getElementById('searchTxt');
search.addEventListener("input", function() {
    let inputVal = search.value.toLowerCase();
    let noteCards = document.getElementsByClassName('noteCard');
    Array.from(noteCards).forEach(function(element) {
        let cardTxt = element.getElementsByTagName("p")[0].innerText;
        if (cardTxt.includes(inputVal)) {
            element.style.display = "block";
        } else {
            element.style.display = "none";
        }
    });
});
