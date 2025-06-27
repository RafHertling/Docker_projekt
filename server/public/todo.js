var tasklist = JSON.parse(localStorage.getItem("myTasks")) || [];
let currentID = parseInt(localStorage.getItem("currentID")) || 1;

async function postTaskToServer(task) {
  try {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(task)
    });
    const data = await response.json();
    // Die echte ID von der Datenbank kommt zurück:
    task.ID = data.id;
    tasklist.push(task);
    localStorage.setItem("myTasks", JSON.stringify(tasklist));
    refreshTask();
  } catch (error) {
    console.error('Fehler beim Senden der Task an den Server:', error);
  }
}

async function deleteTaskFromServer(ID) {
  try {
    await fetch(`/api/tasks/${ID}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error("Fehler beim Löschen der Task vom Server: ", error)
  }
}

function createTask(
  name,
  priorität,
  kategorie,
  duedate,
  beschreibung,
  verantwortlicher
) {
  let task = {
    Name: name,
    Datum: duedate,
    Verantwortlicher: verantwortlicher,
    Kategorie: kategorie,
    Priorität: priorität,
    Beschreibung: beschreibung,
    Status: false
  };
  postTaskToServer(task); // <-- nur an Server schicken
}

function createFrontendTask() {
  let tasknameElement = document.getElementById("taskname");
  let taskBeschreibungElement = document.getElementById("description");
  let taskPrioritätElement = document.getElementById("priority");
  let taskKategorieElement = document.getElementById("category");
  let taskDatumElement = document.getElementById("duedate");
  let taskVerantwortlicherElement = document.getElementById("responsible");

  let name = tasknameElement.value;
  let beschreibung = taskBeschreibungElement.value;
  let verantwortlicher = taskVerantwortlicherElement.value;
  let priorität = taskPrioritätElement.value;
  let kategorie = taskKategorieElement.value;
  let Duedate = taskDatumElement.value;

  createTask(
    name,
    priorität,
    kategorie,
    Duedate,
    beschreibung,
    verantwortlicher
  );
}

function deleteTask(ID) {
  let index = tasklist.findIndex((x) => x.ID === ID);
  if (index !== -1) {
    tasklist.splice(index, 1);
  } else {
    console.log("Task nicht gefunden.");
  }
  refreshTask();
}

function changeTask(ID, updatedTask) {
  let index = tasklist.findIndex((x) => x.ID === ID);
  if (index !== -1) {
    tasklist[index] = { ...tasklist[index], ...updatedTask };
  } else {
    console.log("Task nicht gefunden.");
  }
  refreshTask();
}

function filter(name, priorität, kategorie, duedate, beschreibung) {
  console.log("Kat", kategorie)
  console.log("List", tasklist)

  let filtertasklist = tasklist.filter((task) => {
    const kategoriePasst = kategorie === "" || task.Kategorie === kategorie;
    const prioritätPasst = priorität === "" || task.Priorität === priorität;
    const namePasst = name === "" || task.Name.toLowerCase().includes(name.toLowerCase());
    const duedatePasst = duedate === "" || task.Datum === duedate;
    const textPasst = beschreibung === "" || task.Beschreibung.toLowerCase().includes(beschreibung.toLowerCase());
    return kategoriePasst && prioritätPasst && namePasst && duedatePasst && textPasst;
  });

 

    console.log(priorität)

  returnTask(filtertasklist);
}

function returnTask(filteredTasklist) {
  document.getElementById("listOpen").innerHTML = "";
  document.getElementById("listClosed").innerHTML = "";
  
  let printTasklist = sortByPriority(tasklist);
  if (Array.isArray(filteredTasklist)) {
    printTasklist = sortByPriority(filteredTasklist);
  }
  for (let i = 0; i < printTasklist.length; i++) {
    let task = printTasklist[i];
    const li = document.createElement("li");
    let checked = "";
    if (task.Status) {
      checked = "checked";
    }
    li.innerHTML = `
      <label class="checkbox">
        <input class="checkbox" type="checkbox" id="checkbox-${task.ID}" onchange="checkboxChanged(${task.ID})" ${checked} />
        <span class="checkmark"></span>
      </label>
      ${task.Name}
      <p class="spalte">${task.Kategorie}</p>
      <input type="number" class="hidden-id" value="${task.ID}" hidden>
      <input
        type="date"
        id="Duedate-${task.ID}"
        class="spalte"
        name="trip-start"
                value="${task.Datum}"
      />
      <button class="delete-button" onclick="deleteButton(${task.ID})">
        <svg viewBox="0 0 24 24">
          <path d="M9 3v1H4v2h16V4h-5V3H9zm2 3h2v12h-2V6zm4 0h2v12h-2V6zm-8 0h2v12H7V6zm-2 0h2v12H5V6zM3 4h2v14h14V4h2v16H3V4z" />
        </svg>
      </button>
      <div class="task">
        <div class="task-details"></div>
        <div class="task-actions">
          <button class="edit-button" onclick="openSidebar(${task.ID})">&#x270E;</button>
        </div>
      </div>
    `;
    if (task.Status) {
      document.getElementById("listClosed").appendChild(li);
    } else {
      document.getElementById("listOpen").appendChild(li);
    }

    switch (task.Priorität){
        case "sehr hoch":
        li.style.backgroundColor = "red";
        break;
        case "hoch":
            li.style.backgroundColor = "orange";
            break;
        case "mittel":
            li.style.backgroundColor = "yellow";
            li.style.color = "black;"
            break;
        default:
            break;
        }
  }

  enableDragAndDrop();
}

function openSidebar(id) {
  document.getElementById("sidebar").style.width = "450px";
  let taskIDElement = document.getElementById("taskID");
  let taskNotizElement = document.getElementById("tasknote");
  let taskNameElement = document.getElementById("taskname");
  let taskBeschreibungElemnt = document.getElementById("taskbeschreibung");
  let taskVerantwortlicherElement = document.getElementById(
    "taskverantwortlicher"
  );
  let taskPrioritätElement = document.getElementById("taskpriority");
  let taskKategorieElemnt = document.getElementById("taskkategorie");

  taskIDElement.value = id;
  let index = tasklist.findIndex((x) => x.ID == id);
  if (index !== -1) {
    taskNameElement.value = tasklist[index].Name;
    taskBeschreibungElemnt.value = tasklist[index].Beschreibung;
    taskVerantwortlicherElement.value = tasklist[index].Verantwortlicher;
    taskPrioritätElement.value = tasklist[index].Priorität;
    taskKategorieElemnt.value = tasklist[index].Kategorie;
    
    if (tasklist[index].Notizen && Array.isArray(tasklist[index].Notizen)) {
      taskNotizElement.value = '';
      tasklist[index].Notizen.forEach(note => {
        displayNote(note.text, note.timestamp);
      });
    } else {
      taskNotizElement.value = '';
    }
  } else {
    console.log("Task not found: 404");
  }
}

function changeFrontendTask(event) {
  event.preventDefault();

  let taskIDElement = document.getElementById("taskID");
  let taskNameElement = document.getElementById("taskname");
  let taskBeschreibungElemnt = document.getElementById("taskbeschreibung");
  let taskVerantwortlicherElement = document.getElementById("taskverantwortlicher");
  let taskPrioritätElement = document.getElementById("taskpriority");
  let taskKategorieElemnt = document.getElementById("taskkategorie");
  let taskNotizElement = document.getElementById("tasknote")

  let id = parseInt(taskIDElement.value);
  let name = taskNameElement.value;
  let beschreibung = taskBeschreibungElemnt.value;
  let verantwortlicher = taskVerantwortlicherElement.value;
  let priorität = taskPrioritätElement.value;
  let kategorie = taskKategorieElemnt.value;
  let notiz = taskNotizElement.value;

   let updatedTask = {
    Name: name,
    Beschreibung: beschreibung,
    Verantwortlicher: verantwortlicher,
    Priorität: priorität,
    Kategorie: kategorie,
    Notizen: [] 
  };

  if (notiz) {
    const lines = notiz.split('\n');
    updatedTask.Notizen = lines.map(line => {
      const match = line.match(/\[(.*?)\] (.*)/);
      if (match) {
        return {
          timestamp: new Date(match[1]).toISOString(),
          text: match[2]
        };
      }
      return null;
    }).filter(n => n !== null);
  }

  changeTask(id, updatedTask);
  refreshTask();
}

function deleteButton(ID) {
  ID = parseInt(ID);
  deleteTaskFromServer(ID); // <-- API-Request an Backend
  deleteTask(ID);           // <-- LocalStorage
  refreshTask();
}

function closeSidebar() {
  document.getElementById("sidebar").style.width = "0";
}

function checkboxChanged(ID) {
  let index = tasklist.findIndex((x) => x.ID === ID);
  if (index !== -1) {
    let updatedTask = tasklist[index];
    updatedTask.Status = !updatedTask.Status;
    changeTask(ID, updatedTask);
    refreshTask();
  }
}

function refreshTask() {
  localStorage.setItem("myTasks", JSON.stringify(tasklist));
  returnTask();
  closeSidebar();
}

function enableDragAndDrop() {
  const listContainer = document.querySelectorAll('.collection');

  listContainer.forEach(container => {
    container.addEventListener('dragover', function (event) {
      event.preventDefault();

      const dragged = document.querySelector('.dragging');
      if (!dragged) return;

      const afterElement = getDragAfterElement(container, event.clientY);
      if (afterElement == null) {
        container.appendChild(dragged);
      } else {
        container.insertBefore(dragged, afterElement);
      }
    });
  });

  document.querySelectorAll('.collection li').forEach(item => {
    item.setAttribute('draggable', true);

    item.addEventListener('dragstart', () => {
      item.classList.add('dragging');
    });

    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');

      const newList = item.closest('.collection');
      const siblings = [...newList.querySelectorAll('li')];
      const draggedIndex = siblings.indexOf(item);

      let reference = siblings[draggedIndex + 1] || siblings[draggedIndex - 1];
      if (!reference) return;

      const referenceID = parseInt(reference.querySelector('.hidden-id').value);
      const draggedID = parseInt(item.querySelector('.hidden-id').value);

      const refTask = tasklist.find(t => t.ID === referenceID);
      const draggedTask = tasklist.find(t => t.ID === draggedID);

      if (!refTask || !draggedTask) return;

      draggedTask.Priorität = refTask.Priorität;

      refreshTask();
    });
  });
}

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('li:not(.dragging)')];

  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;

    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function handleFilter() {
  let filterBeschreibungElement = document.getElementById(
    "filter-beschreibung"
  );
  let filterTextElement = document.getElementById("text");
  let filterPrioritätElement = document.getElementById("filter-priority");
  let filterKategorieElement = document.getElementById("filter-kategorie");
  let filterDatumElement = document.getElementById("Duedate");
  filter(
    filterTextElement.value,
    filterPrioritätElement.value,
    filterKategorieElement.value,
    filterDatumElement.value,
    filterBeschreibungElement.value
  );
}

function sortByPriority(list) {
  const order = ["sehr hoch", "hoch", "mittel", "niedrig"];
  return list.slice().sort((a, b) => order.indexOf(a.Priorität) - order.indexOf(b.Priorität));
}

function getNoteId() {
  let noteId = document.getElementById("tasknote");
  localStorage.setItem("Notes", noteId);
}

function setNote() {
    let noteInput = document.getElementById("tasknote").value;
    let timestamp = new Date().toISOString();
    let taskId = document.getElementById("taskID").value;

    let index = tasklist.findIndex(x => x.ID === parseInt(taskId));
    if (index !== -1) {
        if (!tasklist[index].Notizen) {
            tasklist[index].Notizen = [];
        }
        tasklist[index].Notizen.unshift({
            text: noteInput,
            timestamp: timestamp
        });

        localStorage.setItem("myTasks", JSON.stringify(tasklist));
        displayNote(noteInput, timestamp);
    }
}

function displayNote(text, timestamp) {
    let noteElement = document.getElementById("tasknote");
    let dateStr = timestamp ? new Date(timestamp).toLocaleString('de-DE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }) : new Date().toLocaleString('de-DE');
    let existingNotes = noteElement.value;
    let newNote = `[${dateStr}] ${text || ''}`;
    if (existingNotes && existingNotes.trim() !== '') {
        noteElement.value = `${newNote}\n${existingNotes}`;
    } else {
        noteElement.value = newNote;
    }
}