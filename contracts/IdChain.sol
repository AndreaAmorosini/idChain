// SPDX-License-Identifier: MIT
pragma solidity >=0.4.2;

contract IdChain{

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
        uint cap;
        uint phone;
        string email;
        string dataScadenza;
    }

    event IdCardScaduta(
        string message
    );

    event createdIdCard(
        string name,
        string surname,
        string fiscalCode,
        string dataScadenza
    );

    

    //Store the IdCards
    //Utilizza gli address come chiave ma potrebbe non essere ottimale
    //bisogna prevedere un sistema per evitare che una stessa IdCard venga associata a due address diversi
    //non public per evitare che si possano vedere tutte le IdCards di altre persone
    //un ID potrebbe essere il codice fiscale ma allo stesso tempo bisogna collegare all'address la struct
    mapping(address => IdCard) idCards;

    //mapping che contiene tutti codici fiscali registrati associati all'address che l'hanno registrato
    mapping(string => address) registeredCF;

    //Store IdCards Count
    uint public idCardsCount;

    constructor() {
        idCardsCount = 0;
    }

    //crea una nuova IdCard
    //dobbiamo idearci una verifica dell'identità o qualcosa del genere senò ci dirà che non è sicuro
    function createIdCard(string memory _name, string memory _surname,
     string memory _birthDate, string memory _birthPlace, string memory _fiscalCode,
      string memory _homeAddress, string memory _city, string memory _province,
       uint _cap, uint _phone, string memory _email, string memory _dataScadenza) public {
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
        require(_cap > 0);
        //Require a valid phone
        require(_phone > 0);
        //Require a valid email
        require(bytes(_email).length > 0);
        //Require a valid dataScadenza
        require(bytes(_dataScadenza).length > 0);

        //Increment IdCards Count
        idCardsCount ++;

        //Create the IdCard
        idCards[msg.sender] = IdCard(_name, _surname, _birthDate, _birthPlace, _fiscalCode, _homeAddress, _city, _province, _cap, _phone, _email, _dataScadenza);

        //Aggiunge il codice fiscale alla lista dei codici fiscali registrati
        registeredCF[_fiscalCode] = msg.sender;

        //Trigger an event
        emit createdIdCard(_name, _surname, _fiscalCode,_dataScadenza);
    }

    //Delete an IdCard
    //pure qui credo vadano messe delle misure di sicurezza ulteriori
    function deleteIdCard(address _address) public {
        //Require a valid address
        require(_address != address(0));
        //Delete the IdCard
        delete idCards[_address];
        //Decrement IdCards Count
        idCardsCount --;
    }

    //Read an IdCard
    //Non credo possa essere public per motivi di sicurezza e quindi andrebbe implementata un nuovo metodo che sfrutti l'autenticazione tramite spring
    function readIdCard(address _address) private view returns (string memory){
        //Require a valid address
        require(_address != address(0));
        require(keccak256(abi.encodePacked(idCards[_address].dataScadenza)) > keccak256(abi.encodePacked(block.timestamp)));
        //Return the IdCard
        IdCard memory idCard = idCards[_address];
        //se ti stai chiedendo perchè ho fatto una cosa del genere è perchè solidity è stupido e non permetter di ritornare più di 5 valori,
        //quindi ho dovuto concatenare tutto in una stringa e poi ritornarla e poi lato web si fa lo spacchettamento della stringa nei dati che ci servcono
        return (string(abi.encodePacked(idCard.name,"/",idCard.surname ,"/" ,idCard.birthDate ,"/" ,idCard.birthPlace ,"/"
          ,idCard.fiscalCode ,"/" ,idCard.homeAddress ,"/" ,idCard.city ,"/" ,idCard.province ,"/"
           ,idCard.cap ,"/" ,idCard.phone ,"/" ,idCard.email ,"/" ,idCard.dataScadenza))) ;
    }

    //Authorize with IdCard
    //Metodo a cui viene passato l'address e che va a verificare la scadenza della card e restituisce un boolean
    function authorize(address _address) public view returns (bool){
        //Require a valid address
        require(_address != address(0));
        //Return the IdCard
        //non sono pienamente sicuro su questo che l'ho trovato online, poi va testato per bene
        return (keccak256(abi.encodePacked(idCards[_address].dataScadenza)) > keccak256(abi.encodePacked(block.timestamp)));
    }





}
