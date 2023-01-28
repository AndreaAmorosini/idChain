// SPDX-License-Identifier: MIT
pragma solidity >=0.4.2;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";


contract IdChain is AccessControl {

    //address admin
    bytes32 private constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

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
    //Utilizza gli address come chiave
    //non public per evitare che si possano vedere tutte le IdCards di altre persone
    mapping(address => IdCard) private idCards;

    //mapping che contiene tutti codici fiscali registrati associati all'address che l'hanno registrato1
    mapping(string => address) private registeredCF;

    //Store IdCards Count
    uint public idCardsCount;

    constructor(){
        idCardsCount = 0;
        //Crea una IdCard già scaduta per testare il controllo sulla data di scadenza
        idCards[0xCd3dAE09E94aad0bc8e2Bce8d5905384FE838c8E] = IdCard("Test", "Test1", "24/03/2000", "Avellino", "MRSNDR0022", "Via Via Via",
         "Avellino", "AV", "83100", "3311242336", 1642690626, "0xb68fe43f0d1a0d7aef123722670be50268e15365401c442f8806ef83b612976b");
        registeredCF["MRSNDR0022"] = 0xCd3dAE09E94aad0bc8e2Bce8d5905384FE838c8E;
        //aggiunge l'address che ha creato il contratto come admin
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    //crea una nuova IdCard
    function createIdCard(string memory _name, string memory _surname,
     string memory _birthDate, string memory _birthPlace, string memory _fiscalCode,
      string memory _homeAddress, string memory _city, string memory _province,
       string memory _cap, string memory _phone, string memory _password) public returns (string memory){
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

        //require that the fiscalCode is not already registered
        if(registeredCF[_fiscalCode] != address(0)){
            return "CFAlreadyRegistered";
        }

        //require(registeredCF[_fiscalCode] == address(0));


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
        return "success";
    }

    //Delete an IdCard
    function deleteIdCard(string memory _password) public returns (string memory) {
        //Require a valid address
        require(msg.sender != address(0));

        IdCard memory idCard = idCards[msg.sender];
        string memory cf = idCard.fiscalCode;

        if(bytes(idCard.name).length == 0){
            return "cardNotFound";
        }


        if(keccak256(abi.encodePacked(idCard.password)) != keccak256(abi.encodePacked(_password))){
            return "errorPassword";
        }

        //Delete the IdCard
        delete idCards[msg.sender];
        delete registeredCF[cf];
        //Decrement IdCards Count
        idCardsCount --;

        return "cardDeleteSuccess";
    }

    //Read an IdCard
    function readIdCard(string memory _cf, string memory _password) public view returns (string memory){

        //address da leggere
        address addressToRead;

        //controllo su address admin
        if(hasRole(ADMIN_ROLE, msg.sender)){
            //controllo se il codice fiscale è registrato
            require(registeredCF[_cf] != address(0));
            addressToRead = registeredCF[_cf];
        }else{
            addressToRead = msg.sender;
        }

        //Require a valid address
        require(addressToRead != address(0));
        
        //Return the IdCard
        IdCard memory idCard = idCards[addressToRead];

        if(bytes(idCard.name).length == 0){
            return "cardNotFound";
        }

        //controllo sulla password
        if(!hasRole(ADMIN_ROLE, msg.sender)){
            if(keccak256(abi.encodePacked(idCard.password)) != keccak256(abi.encodePacked(_password))){
                return "errorPassword";
            }
        }

        //controllo sulla data di scadenza
        if(!hasRole(ADMIN_ROLE, msg.sender)){
            if(block.timestamp > idCard.dataScadenza){
                return "expireCard";
            }
        }
        
        return (string(abi.encodePacked(idCard.name,"//",idCard.surname ,"//" ,idCard.birthDate ,"//" ,idCard.birthPlace ,"//"
          ,idCard.fiscalCode ,"//" ,idCard.homeAddress ,"//" ,idCard.city ,"//" ,idCard.province ,"//"
           ,idCard.cap ,"//" ,idCard.phone ,"//" ,Strings.toString(idCard.dataScadenza)))) ;
    }

    //Authorize with IdCard
    //Metodo a cui viene passato l'address e che va a verificare la scadenza della card e restituisce un messaggio
    function authorize(string memory _password) public view returns (string memory){
        //Require a valid address
        require(msg.sender != address(0));
        
        IdCard memory idCard = idCards[msg.sender];

        if(bytes(idCard.name).length == 0){
            return "cardNotFound";
        }


        if(keccak256(abi.encodePacked(idCard.password)) != keccak256(abi.encodePacked(_password))){
            return "errorPassword";
        }


        if(block.timestamp > idCard.dataScadenza){
            return "expireCard";
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
            return "cardNotFound";
        }

        if(keccak256(abi.encodePacked(idCard.password)) != keccak256(abi.encodePacked(_password))){
            return "errorPassword";
        }

        //calcola la data di scadenza
        uint dataScadenzaInt = block.timestamp + (10 * 365 days);

        delete idCards[msg.sender];

        idCards[msg.sender] = IdCard(idCard.name, idCard.surname, idCard.birthDate, idCard.birthPlace, idCard.fiscalCode, idCard.homeAddress,
         idCard.city, idCard.province, idCard.cap, idCard.phone, dataScadenzaInt, idCard.password);

        //Trigger an event
        emit renewedIdCard(idCard.name, idCard.surname, idCard.fiscalCode, idCard.dataScadenza);

        return "cardRenewSuccess";
    }

    function isAdmin() public view returns (bool){
        return hasRole(ADMIN_ROLE, msg.sender);
    }





}
