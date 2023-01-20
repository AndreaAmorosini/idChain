// SPDX-License-Identifier: MIT
pragma solidity >=0.4.2;

import "@openzeppelin/contracts/utils/Strings.sol";

contract IdChain{

    //address admin
    address adminAddress = 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4;

    //Model a IdCard
    struct IdCard{
        string name;
        string surname;
        string birthDate;
        string birthPlace;
        string fiscalCode;
        string homeAddress;
        string city;
        string province;
        string cap;
        string phone;
        //string email;
        uint dataScadenza;
        string password;
    }

    event IdCardScaduta(
        string message
    );

    event createdIdCard(
        string name,
        string surname,
        string fiscalCode,
        uint dataScadenza
    );

    event renewedIdCard(
        string name,
        string surname,
        string fiscalCode,
        uint dataScadenza
    );

    

    //Store the IdCards
    //Utilizza gli address come chiave ma potrebbe non essere ottimale
    //bisogna prevedere un sistema per evitare che una stessa IdCard venga associata a due address diversi
    //non public per evitare che si possano vedere tutte le IdCards di altre persone
    //un ID potrebbe essere il codice fiscale ma allo stesso tempo bisogna collegare all'address la struct
    mapping(address => IdCard) private idCards;

    //mapping che contiene tutti codici fiscali registrati associati all'address che l'hanno registrato1
    mapping(string => address) private registeredCF;

    //Store IdCards Count
    uint public idCardsCount;

    constructor(){
        idCardsCount = 0;
        idCards[0xAe58aAcc644bAd5dc2142e4D57890dc95363eB3d] = IdCard("Test", "Test1", "24/03/2000", "Avellino", "MRSNDR0022", "Via Via Via",
         "Avellino", "AV", "83100", "3311242336", 1642690626, "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8");

    }

    //crea una nuova IdCard
    //dobbiamo idearci una verifica dell'identità o qualcosa del genere senò ci dirà che non è sicuro
    function createIdCard(string memory _name, string memory _surname,
     string memory _birthDate, string memory _birthPlace, string memory _fiscalCode,
      string memory _homeAddress, string memory _city, string memory _province,
       string memory _cap, string memory _phone, string memory _password) public {
        //require that the fiscalCode is not already registered
        require(registeredCF[_fiscalCode] == address(0));
        //Require a valid name
        require(bytes(_name).length > 0);
        //Require a valid surname
        require(bytes(_surname).length > 0);
        //Require a valid birthDate
        require(bytes(_birthDate).length > 0);
        //Require a valid birthPlace
        require(bytes(_birthPlace).length > 0);
        //Require a valid fiscalCode
        require(bytes(_fiscalCode).length > 0);
        //Require a valid homeAddress
        require(bytes(_homeAddress).length > 0);
        //Require a valid city
        require(bytes(_city).length > 0);
        //Require a valid province
        require(bytes(_province).length > 0);
        //Require a valid cap
        require(bytes(_cap).length > 0);
        //Require a valid phone
        require(bytes(_phone).length > 0);
        //Require a valid email
        //require(bytes(_email).length > 0);

        //Increment IdCards Count
        idCardsCount ++;

        //calcola la data di scadenza
        uint dataScadenzaInt = block.timestamp + (10 * 365 days);

        //Create the IdCard
        idCards[msg.sender] = IdCard(_name, _surname, _birthDate, _birthPlace, _fiscalCode, _homeAddress,
         _city, _province, _cap, _phone, dataScadenzaInt, _password);

        //Aggiunge il codice fiscale alla lista dei codici fiscali registrati
        registeredCF[_fiscalCode] = msg.sender;

        //Trigger an event
        emit createdIdCard(_name, _surname, _fiscalCode, dataScadenzaInt);
    }

    //Delete an IdCard
    //pure qui credo vadano messe delle misure di sicurezza ulteriori
    function deleteIdCard(string memory _password) public returns (string memory) {
        //Require a valid address
        require(msg.sender != address(0));

        IdCard memory idCard = idCards[msg.sender];

        if(bytes(idCard.name).length == 0){
            return "La carta non esiste";
        }


        if(keccak256(abi.encodePacked(idCard.password)) != keccak256(abi.encodePacked(_password))){
            return "Password errata";
        }

        //Delete the IdCard
        delete idCards[msg.sender];
        //Decrement IdCards Count
        idCardsCount --;

        return "Carta Eliminata con successo";
    }

    //Read an IdCard
    //Non credo possa essere public per motivi di sicurezza e quindi andrebbe implementata un nuovo metodo che sfrutti l'autenticazione tramite spring
    function readIdCard(address _address, string memory _password) public view returns (string memory){

        //address da leggere
        address addressToRead;

        //controllo su address admin
        if(msg.sender == adminAddress){
            addressToRead = _address;
        }else{
            addressToRead = msg.sender;
        }

        //Require a valid address
        require(addressToRead != address(0));
        
        //Return the IdCard
        IdCard memory idCard = idCards[addressToRead];

        if(bytes(idCard.name).length == 0){
            return "La carta non esiste";
        }

        //require(keccak256(abi.encodePacked(idCard.password)) == keccak256(abi.encodePacked(_password)));

        if(keccak256(abi.encodePacked(idCard.password)) != keccak256(abi.encodePacked(_password))){
            return "Password errata";
        }

        //controllo sulla data di scadenza
        if(block.timestamp > idCard.dataScadenza){
            return "La carta e' scaduta, si prega di rinnovare la carta";
        }
        
        //se ti stai chiedendo perchè ho fatto una cosa del genere è perchè solidity è stupido e non permetter di ritornare più di 5 valori,
        //quindi ho dovuto concatenare tutto in una stringa e poi ritornarla e poi lato web si fa lo spacchettamento della stringa nei dati che ci servcono
        return (string(abi.encodePacked(idCard.name,"//",idCard.surname ,"//" ,idCard.birthDate ,"//" ,idCard.birthPlace ,"//"
          ,idCard.fiscalCode ,"//" ,idCard.homeAddress ,"//" ,idCard.city ,"//" ,idCard.province ,"//"
           ,idCard.cap ,"//" ,idCard.phone ,"//" ,Strings.toString(idCard.dataScadenza)))) ;
    }

    //Authorize with IdCard
    //Metodo a cui viene passato l'address e che va a verificare la scadenza della card e restituisce un boolean
    function authorize(string memory _password) public view returns (string memory){
        //Require a valid address
        require(msg.sender != address(0));
        
        IdCard memory idCard = idCards[msg.sender];

        if(bytes(idCard.name).length == 0){
            return "La carta non esiste";
        }


        if(keccak256(abi.encodePacked(idCard.password)) != keccak256(abi.encodePacked(_password))){
            return "Password errata";
        }


        if(block.timestamp > idCard.dataScadenza){
            return "La carta e' scaduta, si prega di rinnovare la carta";
        }else{
            return "Autorizzato";
        }

    }

    //funzione per rinnovare la carta (rigenera la data di scadenza)
    function renewIdCard(string memory _password) public returns (string memory){
        //Require a valid address
        require(msg.sender != address(0));
        
        IdCard memory idCard = idCards[msg.sender];

        if(bytes(idCard.name).length == 0){
            return "La carta non esiste";
        }

        if(keccak256(abi.encodePacked(idCard.password)) != keccak256(abi.encodePacked(_password))){
            return "Password errata";
        }

        //calcola la data di scadenza
        uint dataScadenzaInt = block.timestamp + (10 * 365 days);

        delete idCards[msg.sender];

        idCards[msg.sender] = IdCard(idCard.name, idCard.surname, idCard.birthDate, idCard.birthPlace, idCard.fiscalCode, idCard.homeAddress,
         idCard.city, idCard.province, idCard.cap, idCard.phone, dataScadenzaInt, idCard.password);

        //Trigger an event
        emit renewedIdCard(idCard.name, idCard.surname, idCard.fiscalCode, idCard.dataScadenza);

        return "Carta rinnovata con successo";
    }





}
