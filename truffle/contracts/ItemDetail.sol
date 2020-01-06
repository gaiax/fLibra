pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

contract ItemDetail {
    
    address constant temporaryPurchaser = address(0);
    Item[] public item;
    address internal itemOwner;
    
    struct Item {
        string itemName;
        string itemPhoto;
        uint256 price;
        string itemDetailText; 
        uint category;
        uint itemCondition;
     } 
     
    event EditItem(string _itemName, string _itemPhoto, uint256 _price, string _itemDetailText, uint _category, uint _itemCondition);
    
    constructor(string memory _itemName, string memory _itemPhoto, uint256 _price, string memory _itemDetailText,  uint _category, uint _itemCondition) public {
        itemOwner = msg.sender;
        item.push(Item(_itemName, _itemPhoto, _price, _itemDetailText, _category, _itemCondition));
    }
    
    
    function getItem() public view returns(Item memory) {
        return item[0];
    }
    
    function editItem(string memory _itemName, string memory _itemPhoto, uint256 _price, string memory _itemDetailText,  uint _category,  uint _itemCondition) public {
        require(itemOwner == msg.sender);
        Item memory _item = item[0];
        _item.itemName = _itemName;
        _item.itemPhoto = _itemPhoto;
        _item.price = _price;
        _item.itemDetailText = _itemDetailText;
        _item.category = _category;
        _item.itemCondition = _itemCondition;
        item[0] = _item;
        emit EditItem(_itemName, _itemPhoto, _price, _itemDetailText, _category, _itemCondition);
    }

    function deleteItem() public payable {
        require(itemOwner == msg.sender);
        selfdestruct(msg.sender);
    }
    
    
}