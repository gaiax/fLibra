pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

contract FLibra {

  string constant temporaryPurchaser = "0000000000000000000000000000000000000000000000000000000000";
  uint256 internal itemId = 0;
  uint256[] public onSaleItems;

  mapping(uint => Item) public allItems;

  mapping(string => uint[]) internal myItemId;
  mapping(string => uint[]) internal myPurchasedItemId;
  mapping(string => User) public UserInfo;
  mapping(uint256 => SellerReview) public reviewToSeller;
  mapping(uint256 => PurchaserReview) public reviewToPurchaser;

  // structs
  struct Item {
    uint256 id;
    address itemDetailContract;
    string seller;
    string purchaser;
    bool selling;
    bool delivered;
  }

  struct User {
    string userAddress;
    string userName;
    string userIcon;
  }

  struct SellerReview {
    uint256 itemId;
    uint256 star;
    string text;
  }

  struct PurchaserReview {
    uint256 itemId;
    uint256 star;
    string text;
  }

  //events
  event PostItem(uint256 id, address itemDetailContract, string seller, string purchaser, bool selling, bool delivered);
  event ItemPurchased(uint256 id, string purchaser);
  event ItemDelivered(uint256 id, bool delivered);
  // EditItem(uint256 id, string itemName, uint256 price);
  event UserInfoCreated(string userAddress, string userName, string userIcon);
  event WriteReviewToSeller(uint256 itemId, uint256 star, string text);
  event WriteReviewToPurchaser(uint256 itemId, uint256 star, string text);

  constructor() public {

  }

  // -------- Create user info --------
  function setUserInfo(string memory _userName, string memory _userIcon, string memory _userLibraAddress) public {
    UserInfo[_userLibraAddress] = User(_userLibraAddress, _userName, _userIcon);
    emit UserInfoCreated(_userLibraAddress, _userName, _userIcon);
  } 

  // -------- Post a Item --------
  function postItem(address _itemDetailContract, string memory _sellerLibraAddress) public {
    itemId = itemId + 1;
    allItems[itemId] = Item(itemId, _itemDetailContract, _sellerLibraAddress, temporaryPurchaser, true, false);
    myItemId[_sellerLibraAddress].push(itemId);
    //onSaleItems[allItems[itemId].selling].push(allItems[itemId].id);
    emit PostItem(itemId, _itemDetailContract, _sellerLibraAddress, temporaryPurchaser, true, false);
  }

  // -------- Purchase a Item --------
  function purchaseItem(uint256 _id, string memory _purchaserLibraAddress) public {
    require(allItems[_id].selling == bool(true));
    require(keccak256(bytes(allItems[_id].seller)) != keccak256(bytes(_purchaserLibraAddress)));
    Item memory _item = allItems[_id];
    _item.selling = bool(false);
    _item.purchaser = _purchaserLibraAddress;
    allItems[_id] = _item;
    myPurchasedItemId[_purchaserLibraAddress].push(_id);
    emit ItemPurchased(_id, _purchaserLibraAddress);
  }

  function itemDelivered(uint256 _id, string memory _purchaserLibraAddress) public {
    require(keccak256(bytes(allItems[_id].purchaser)) == keccak256(bytes(_purchaserLibraAddress)));
    Item memory _item = allItems[_id];
    _item.delivered = bool(true);
    allItems[_id] = _item;
    emit ItemDelivered(_id, true);
  }

  // -------- Write Review to Seller --------
  function writeReviewToSeller(uint256 _id, uint256 _star, string memory _text, string memory _purchaserLibraAddress) public {
    require(allItems[_id].selling == bool(false));
    require(keccak256(bytes(allItems[_id].purchaser)) == keccak256(bytes(_purchaserLibraAddress)));
    reviewToSeller[_id] = SellerReview(_id, _star, _text);
    emit WriteReviewToSeller(_id, _star, _text);
  }

  // -------- Write Review to Purchaser --------
  function writeReviewToPurchaser(uint256 _id, uint256 _star, string memory _text, string memory _sellerLibraAddress) public {
    require(allItems[_id].selling == bool(false));
    require(keccak256(bytes(allItems[_id].seller)) == keccak256(bytes(_sellerLibraAddress)));
    reviewToPurchaser[_id] = PurchaserReview(_id, _star, _text);
    emit WriteReviewToPurchaser(_id, _star, _text);
  }

  // -------- My Items --------
  function getMyItemId(string memory _libraAddress) public view returns (uint[] memory) {
    return myItemId[_libraAddress];
  }

  function getMyItem(uint256 _id) public view returns (Item memory) {
    return allItems[_id];
  } 

  // -------- All Items --------
  function getNumberOfItem() public view returns (uint256) {
    return itemId;
  }

  function getAllItem(uint256 _id) public view returns (Item memory) {
    return allItems[_id];
  } 

  // -------- On Sale Items --------
  function getOnSaleItemsId(bool _selling) public view returns (uint[] memory) {

  }

  function getItemOnSale(uint256 _id) public view returns (Item memory) {
    if (allItems[_id].selling == bool(true)) {
      return allItems[_id];
    }
  }

  // -------- My Purchased Items --------
  function getMyPurchasedItemId(string memory _libraAddress) public view returns (uint[] memory) {
    return myPurchasedItemId[_libraAddress];
  }

  function getMyPurchasedItem(uint256 _id) public view returns (Item memory) {
    require(allItems[_id].selling == bool(false) );
    return allItems[_id];
  } 

  // -------- UserInfo --------
  function getUserInfo(string memory _userLibraAddress) public view returns (User memory) {
    return UserInfo[_userLibraAddress];
  }

  // -------- Review --------
  function getSellerReview(uint256 _id) public view returns (SellerReview memory) {
    return reviewToSeller[_id];
  } 

  function getPurchaserReview(uint256 _id) public view returns (PurchaserReview memory) {
    return reviewToPurchaser[_id];
  } 
}