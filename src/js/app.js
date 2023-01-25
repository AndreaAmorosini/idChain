App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
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
    web3.eth.defaultAccount = web3.eth.accounts[0];
    return App.initContract();
  },

  initContract: function() {
    // Json generato alla compilazione dello smart contract
    $.getJSON('IdChain.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var idChainArtifact = data;
      App.contracts.IdChain = TruffleContract(idChainArtifact);

      // Set the provider for our contract
      App.contracts.IdChain.setProvider(App.web3Provider);

      var idCardInstance;

      App.contracts.IdChain.deployed().then(function(instance) {
        idCardInstance = instance;
      })
    }).then(function() { return App.createLandingPage(); });


  },

  //bindEvents: function() {
  //  $(document).on('click', '.btn-adopt', App.handleAdopt);
  //},
  getInstance: function() {
    var idCardInstance = App.contracts.IdChain.deployed().then(function(instance) {
      return instance;
    })
    return idCardInstance;
  },

  createIdCard: function() {

    var form = document.registrationForm;

    var idCardInstance = App.getInstance();

    //idCardInstance.createIdCard(form.elements["name"].value, form.elements["surname"].value, form.elements["birthDate"].value, form.elements["birthPlace"].value, form.elements["cf"].value, form.elements["homeAddress"].value, form.elements["city"].value, form.elements["province"].value, form.elements["cap"].value, form.elements["phone"].value, form.elements["password"].value);
    // Non metto gli id perché gli elementi hanno giá id a caso
    //idCardInstance.createIdCard(form.elements[0].value, form.elements[1].value, form.elements[9].value, form.elements[8].value, form.elements[2].value, form.elements[4].value, form.elements[5].value, form.elements[6].value, form.elements[7].value, form.elements[3].value, form.elements[10].value);

    App.contracts.IdChain.deployed().then(function(instance) {
      var form = document.registrationForm;
      return instance.createIdCard(form.elements[0].value, form.elements[1].value, form.elements[9].value, form.elements[8].value, form.elements[2].value, form.elements[4].value, form.elements[5].value, form.elements[6].value, form.elements[7].value, form.elements[3].value, form.elements[10].value);
    }).then(function() {
      return App.createLoginPage();
    })

  },

  userReadIdCard: function() {
    var idCardInstance = App.getInstance();
    var form = document.loginForm;
    
    //var results = idCardInstance.readIdCard('', form.elements[0].value);

    App.contracts.IdChain.deployed().then(function(instance) {
      var form = document.loginForm;
      var idChainInstance = instance;
      return idChainInstance.readIdCard('', form.elements[0].value);
    }).then(function(results) {
      details = results.split('//');
      if (details.length == 1) {
        return App.createErrorPage();
      }
      return App.createDetailsPage();
    })
  },

  searchIdCard: function() {
    var idCardInstance = App.getInstance();

    var form = document.loginForm;
    var results = idCardInstance.readIdCard(form.elements["cf"].value, '');

    // Parsing della stringa ad array
    var resultArray = results.split('//')

    // Conviene cambiare come sono dati gli errori dallo smart contract
    // perché js puó essere cambiato in runtime, mentre lo smart contract
    // necessita di migrazione (e quindi soldi) in caso si voglia cambiare
    // il messaggio di errore.
    if (resultArray.length == 1) {
      return App.createErrorPage(resultArray);
    }

    return App.createDetailsPage(resultArray);
  },

  renewIdCard: function() {
    var password = form.elements[0].value;

    var idCardInstance = App.getInstance();

    result = idCardInstance.renewIdCard(password);
    // Sfrutto la pagina per l'errore per mostrare il messaggio di risposta,
    // Non cambia molto se e' errore o no.
    // Bisogna comunque effettuare il login di nuovo.
    App.createErrorPage(result);
  },

  messageHandler: function(message) {
    switch(message) {
      // Errori
      case 'errorPassword':
        var finalmessage = "La password inserita non e' corretta.";
        break;
      case 'cardNotFound':
        var finalmessage = "La carta richiesta non e' stata trovata.";
        break;
      case 'expireCard':
        var finalmessage = "La carta e' scaduta, si prega di rinnovare la carta.";
        break;

      // Successo
      case 'cardDeleteSuccess':
        var finalmessage = "La carta e' stata rimossa con successo.";
        break;
      case 'Autorizzato':
        var finalmessage = "Autorizzazione avvenuta con successo.";
        break;
      case 'cardRenewSuccess':
        var finalMessage = "La carta e' stata rinnovata con successo.";
        break;
      default:
        return;
    }

  return finalMessage;

    // Se si aggiunge uno spazio dedicato su ogni pagina, sarebbe possibile
    // modificare il messaggio senza effettuare un redirect, ma non e' possibile
    // farlo con tutte le opzioni
    //
    // $("#error").text(finalMessage);
    //
    // Per tornare alla landing page dopo aver mostrato un errore per 5 secondi:
    //
    // $("#error").append("\nTornerete alla pagina iniziale entro 5 secondi.")
    // setTimeout(App.createLandingPage, 5000);
  },

  authorizeRequest: function() {
    var password = form.elements["password"];

    var idCardInstance = App.getInstance();

    return idCardInstance.authorize(password);
  },

  createLandingPage: function () {
    // Pagina iniziale, come e' fatta ora.
    // Ha due pulsanti: uno per il login e uno per la registrazione.
    // Avviene tramite caricamento di un file html.
    // Il contratto dovrebbe caricare automaticamente il file index.html: aggiungendo un id #page e' possibile
    // riutilizzare sempre la stessa pagina, rimpiazzando gli elementi con id #page.
    // Da vedere se utilizzare redirect al posto di load

    // Inoltre, bisogna vedere come fare la pagina dell'amministratore.
    App.contracts.IdChain.deployed().then(function(instance) {
      var form = document.loginForm;
      var idChainInstance = instance;
      return idChainInstance.isAdmin();
    }).then(function(boolIsAdmin) {
      $(document).on('click', '.btn-redirToLanding', App.createLandingPage)
      if(boolIsAdmin) {
        $("#page").load("./html/LandingPage.html");
        $(document).on('click', '.btn-submitSearch', App.searchIdCard);
      }
      else {
        $("#page").load("./html/LandingPage.html")
        $(document).on('click', '.btn-redirToLogin', App.createLoginPage);
        $(document).on('click', '.btn-redirToRegistration', App.createRegistrationPage);
      }
    });
  },

  createLoginPage: function() {
    // Un pulsante per il submit con classe .btn-readIdCard
    // e un altro pulsante con classe .btn-redirToRegistration per il redirect alla pagina di registrazione.

    $("#page").load("./html/LoginPage.html");

    // Effettua il binding della funzione userReadIdCard al pulsante per il login
    $(document).on('click', '.btn-readIdCard', App.userReadIdCard);

    // Effettua il binding della funzione createRegistrationPage al pulsante per il redirect alla pagina di registrazione
    //$(document).on('click', '.btn-redirToRegistration', App.createRegistrationPage);
  },

  createRegistrationPage: function() {
    // Creazione della pagina di registrazione.
    // Avviene tramite caricamento di un file html, che rimpiazza i contenuti di #page
    // E' presente un form con un pulsante con classe .btn-register

    $("#page").load("./html/RegisterPage.html");
    $(document).on('click', '.btn-register', App.createIdCard);

    
  },

  createDetailsPage: function() {
    // Creazione della pagina di visualizzazione dei dati.
    // Si effettua l'accesso a questa pagina tramite registrazione o login.
    $("#page").load("./html/DetailsPage.html", function() {
      console.log(details);
      $("#name-a4d5").val(details[0]);
      $('#surname-a4d5').val(details[1]);
      $('#date-3062').val(details[2]);
      $('#text-ec06').val(details[3]);
      $('#fiscCode').val(details[4]);
      $('#address-662c').val(details[5]);
      $('#text-1575').val(details[6]);
      $('#text-6504').val(details[7]);
      $('#text-1ea9').val(details[8]);
      $('#phone-894b').val(details[9]);
    });
    // Aggiunta dei dati tramite jquery e id di elementi html

    // Aggiunta dei binding sul pulsante di eliminazione e di rinnovo della carta
    // Classi: .btn-deleteIdCard, .btn-renewIdCard
    // Fanno parte di un form dove e' presente un box per la password
    //$(document).on('click', '.btn-deleteIdCard', App.deleteIdCard);
    //$(document).on('click', '.btn-renewIdCard', App.renewIdCard);
  },

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
    App.addInlineMessage(error);

    // Aggiungere pulsante di rinnovo pagina, messa un po' come placeholder
      // Si potrebbe fare una pagina solo per mostrare
      // il messaggio di errore della scadenza (ed e' anche gia' fatta)
      // In quel caso meglio creare una nuova funzione.
      // Modificherei prima l'handling degli errori nello smart contract:
      // ritornare la stringa con l'errore completo mi pare eccessivo,
      // Si potrebbe utilizzare un int, enum o anche semplicemente una stringa con
      // il nome dell'errore, come "passwordErrata" o "cartaScaduta"
      $(document).on('click', 'btn-renewIdCard', App.renewIdCard);
  },

  addInlineMessage: function(message) {
    return $("#message").text(App.messageHandler(message));
  }
};

//$(function() {
//  $(window).load(function() {
//    App.init();
//  });
//});
var details = null;

$(function() {
  $(document).ready(function() {
    App.init();
  });
});
