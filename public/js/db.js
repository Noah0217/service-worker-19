let db;
const request = indexedDB.open('budget_tracker', 1);


request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('new_data', { autoIncrement: true });
};

// app must be online to get data
request.onsuccess = function(event) {
    db = event.target.result;

    if (navigator.onLine) {
      appOnline();
    }
  };
  
request.onerror = function(event) {
console.log(event.target.errorCode);
};

//new upload
function saveRecord(record) {
    const transaction = db.transaction(["new_data"], "readwrite");
    const budgetObjectStore = transaction.objectStore("new_data");
    budgetObjectStore.add(record);
  }

  function appOnline() {
    const transaction = db.transaction(["new_data"], "readwrite");
    const store = transaction.objectStore("new_data");
    const getAll = store.getAll();
  
    //
    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
          fetch("/api/transaction", {
            method: "POST",
            body: JSON.stringify(getAll.result),
            headers: {
              Accept: "application/json, text/plain, */*",
              "Content-Type": "application/json"
            }
          })
            .then(response => response.json())
            .then(() => {
              const transaction = db.transaction(["new_data"], "readwrite");
              const store = transaction.objectStore("new_data");
              store.clear();
            });
        }
      };

    }

    //delete
    function deletePending() {
      const transaction = db.transaction(["new_data"], "readwrite");
      const store = transaction.objectStore("new_data");
      store.clear();
    }


    //waiting for app to come online
    window.addEventListener("online", appOnline);