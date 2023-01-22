App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load pets.
    //$.getJSON('../pets.json', function(data) {
      //var petsRow = $('#petsRow');
      //var petTemplate = $('#petTemplate');

      //for (i = 0; i < data.length; i ++) {
      //  petTemplate.find('.panel-title').text(data[i].name);
      //  petTemplate.find('img').attr('src', data[i].picture);
      //  petTemplate.find('.pet-breed').text(data[i].breed);
      //  petTemplate.find('.pet-age').text(data[i].age);
      //  petTemplate.find('.pet-location').text(data[i].location);
      //  petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

      //  petsRow.append(petTemplate.html());
      //}
    //});

    return await App.initWeb3();
  },

  initWeb3: async function() {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Adoption.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var idChainArtifact = data;
      App.contracts.IdChain = TruffleContract(idChainArtifact);

      // Set the provider for our contract
      App.contracts.IdChain.setProvider(App.web3Provider);

    });

    var idCardInstance;

    App.contracts.IdChain.deployed().then(function(instance) {
      idCardInstance = instance;
    }).then(function() {

    })

    return App.createLandingPage();
  },

  //bindEvents: function() {
  //  $(document).on('click', '.btn-adopt', App.handleAdopt);
  //},

  readIdCard: function() {

  },

  createIdCard: function() {
    // Da modificare i valori dell'array quando si ha un ordine finale per i form,
    // ora li ho messi a caso
    idCardInstance.createIdCard(form.elements[0].value, form.elements[1].value, form.elements[2].value, form.elements[3].value, form.elements[4].value, form.elements[5].value, form.elements[6].value, form.elements[7].value, form.elements[8].value, form.elements[9].value, form.elements[10].value);

    return App.createLoginPage();
  },

  readIdCard: function() {
    // Come per createIdCard
    var results = idCardInstance.readIdCard(form.elements["address"].value ,form.elements[0].value, form.elements[1].value);

    // Parsing della stringa ad array
    var resultArray = results.split('//')

    // Conviene cambiare come sono dati gli errori dallo smart contract
    // perché js puó essere cambiato in runtime, mentre lo smart contract
    // necessita di migrazione (e quindi soldi) in caso si voglia cambiare
    // il messaggio di errore.
    if (resultArray.length == 1) {
      return App.createErrorPage(results);
    }

    return App.createDetailsPage(resultArray);
  },

  renewIdCard: function() {
    var password = form.elements[0].value;

    result = idCardInstance.renewIdCard(password);
    // Sfrutto la pagina per l'errore per mostrare il messaggio di risposta,
    // Non cambia molto se e' errore o no.
    // Bisogna comunque effettuare il login di nuovo.
    App.createErrorPage(result);
  }

  handleAdopt: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    /*
     * Replace me...
     */
  },

  createLandingPage: function () {
    // Pagina iniziale, come e' fatta ora.
    // Ha due pulsanti: uno per il login e uno per la registrazione.
    // Avviene tramite caricamento di un file html.
    // Il contratto dovrebbe caricare automaticamente il file index.html: aggiungendo un id #page e' possibile
    // riutilizzare sempre la stessa pagina, rimpiazzando gli elementi con id #page.
    // Da vedere se utilizzare redirect al posto di load
    //
    // Inoltre, bisogna vedere come fare la pagina dell'amministratore.

    // Binding dei pulsanti
    $(document).on('click', '.btn-redirToLogin', App.createLoginPage);
    $(document).on('click', '.btn-redirToRegistration', App.createRegistrationPage);
  }

  createLoginPage: function() {
    // Un pulsante per il submit con classe .btn-readIdCard
    // e un altro pulsante con classe .btn-redirToRegistration per il redirect alla pagina di registrazione.

    $("#page").load("../loginPage.html");

    // Effettua il binding della funzione readIdCard al pulsante per il login
    $(document).on('click', '.btn-readIdCard', App.readIdCard);

    // Effettua il binding della funzione createRegistrationPage al pulsante per il redirect alla pagina di registrazione
    //$(document).on('click', '.btn-redirToRegistration', App.createRegistrationPage);
  },

  createRegistrationPage: function() {
    // Creazione della pagina di registrazione.
    // Avviene tramite caricamento di un file html, che rimpiazza i contenuti di #page
    // E' presente un form con un pulsante con classe .btn-register

    $("#page").load("../registrationPage.html");
    $(document).on('click', '.btn-register', App.createIdCard);
  }

  createDetailsPage: function(details) {
    // Creazione della pagina di visualizzazione dei dati.
    // Si effettua l'accesso a questa pagina tramite registrazione o login.
    $("#page").load("../detailsPage.html");
    // Aggiunta dei dati tramite jquery e id di elementi html
    $('#name').text(details[0]);
    $('#surname').text(details[1]);
    $('#birthDate').text(details[2]);
    $('#birthPlace').text(details[3]);
    $('#fiscalCode').text(details[4]);
    $('#homeAddress').text(details[5]);
    $('#city').text(details[6]);
    $('#province').text(details[7]);
    $('#cap').text(details[8]);
    $('#phone').text(details[9]);

    // Aggiunta dei binding sul pulsante di eliminazione e di rinnovo della carta
    // Classi: .btn-deleteIdCard, .btn-renewIdCard
    // Fanno parte di un form dove e' presente un box per la password
    $(document).on('click', '.btn-deleteIdCard', App.deleteIdCard)
    $(document).on('click', '.btn-renewIdCard', App.renewIdCard)
  }

  createErrorPage: function(error) {
    // Creazione della pagina di errore. Viene chiamata se la carta non esiste, la password e' errata,
    // La carta e' scaduta etc...
    // Viene data in input una stringa contenente l'errore, che sostituira'
    // l'elemento con l'id #error nel file html.
    //
    // Sarebbe possibile sennó aggiungere uno spazio dedicato agli errori sulle pagine
    // sulle quali si trova l'utente prima di avere l'errore.
    // In particolare, secondo me gli errori dovrebbero essere mostrati solo sulla
    // pagina di login
    // Viene dunque mostrato il messaggio di errore tramite js.

    $("#page").load("../errorPage.html");
    $("#error").text(error);

    if(error == "La carta e' scaduta, si prega di rinnovare la carta") {
      // Aggiungere pulsante di rinnovo pagina, messa un po' come placeholder
      // Si potrebbe fare una pagina solo per mostrare
      // il messaggio di errore della scadenza (ed e' anche gia' fatta)
      // In quel caso meglio creare una nuova funzione.
      // Modificherei prima l'handling degli errori nello smart contract:
      // ritornare la stringa con l'errore completo mi pare eccessivo,
      // Si potrebbe utilizzare un int, enum o anche semplicemente una stringa con
      // il nome dell'errore, come "passwordErrata" o "cartaScaduta"
      $(document).on('click', 'btn-renewIdCard', App.renewIdCard);
    }
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
