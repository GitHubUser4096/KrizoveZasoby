--- Create Database ---
drop database if exists EmergencySupplies;
create database EmergencySupplies;
use EmergencySupplies;

--- Tables (new) ---

create table User(
  id int primary key auto_increment,
  email varchar(64) not null unique,
  password varchar(255),
  userRole enum('disabled', 'viewer', 'contributor', 'editor', 'admin') default ('contributor'),
  googleLogin boolean not null default 0
);

create table Bag(
  id int primary key auto_increment,
  name varchar(64) not null,
  description varchar(1024),
  userId int not null,
  donated boolean not null default 0,
  donatedDate datetime,
  foreign key (userId) references User(id)
);

create table Brand(
  id int primary key auto_increment,
  name varchar(64) not null unique
);

create table PackageType(
  id int primary key auto_increment,
  name varchar(64) not null unique
);

create table Product(
  id int primary key auto_increment,
  brandId int not null,
  shortDesc varchar(128) not null,
  code varchar(64) not null unique,
  imgName varchar(64),
  packageTypeId int,
  amountValue int,
  amountUnit enum('g', 'ml') default 'g',
  createdBy int not null,
  notified boolean not null default 0,
  foreign key (brandId) references Brand(id),
  foreign key (packageTypeId) references PackageType(id),
  foreign key (createdBy) references User(id)
);

create table ProductEditSuggestion(
  id int primary key auto_increment,
  productId int not null,
  brandId int,
  changedBrandId boolean not null default 0,
  shortDesc varchar(128),
  changedShortDesc boolean not null default 0,
  code varchar(64),
  changedCode boolean not null default 0,
  imgName varchar(64),
  changedImgName boolean not null default 0,
  packageTypeId int,
  changedPackageTypeId boolean not null default 0,
  amountValue int,
  changedAmountValue boolean not null default 0,
  amountUnit enum('g', 'ml') default 'g',
  changedAmountUnit boolean not null default 0,
  editedBy int not null,
  notified boolean not null default 0,
  foreign key (productId) references Product(id),
  foreign key (brandId) references Brand(id),
  foreign key (packageTypeId) references PackageType(id),
  foreign key (editedBy) references User(id)
);

create table Item(
  id int primary key auto_increment,
  count int not null,
  used boolean not null default 0,
  expiration date,
  productId int not null,
  bagId int not null,
  foreign key (productId) references Product(id),
  foreign key (bagId) references Bag(id)
);

create table Config(
  id int primary key auto_increment,
  userId int not null,
  criticalTime varchar(16) default '1 days',
  warnTime varchar(16) default '1 weeks',
  recommendedTime varchar(16) default '3 weeks',
  dateFormat varchar(16) default 'Y-m-d',
  sendNotifs boolean not null default 1,
  itemDisplay enum('brandFirst', 'typeFirst') default 'brandFirst',
  sort enum('date', 'name') default 'date'
);

create table ResetPasswordRequests(
  id int primary key auto_increment,
  userId int not null,
  code varchar(32) not null,
  expires datetime not null,
  foreign key (userId) references User(id)
);

create table Charity(
  id int primary key auto_increment,
  orgId varchar(32) not null unique,
  name varchar(128) not null unique,
  contactWeb varchar(32),
  contactMail varchar(32),
  contactPhone varchar(32),
  isApproved boolean not null default 0,
  notified boolean not null default 0
);

create table CharityPlace(
  id int primary key auto_increment,
  charityId int not null,
  street varchar(64) not null,
  place varchar(64) not null,
  postCode varchar(32) not null,
  note varchar(256),
  openHours varchar(256),
  contactWeb varchar(32),
  contactMail varchar(32),
  contactPhone varchar(32),
  latitude decimal(9, 6),
  longitude decimal(9, 6),
  foreign key (charityId) references Charity(id)
);

create table CharityUser(
  id int primary key auto_increment,
  charityId int not null,
  userId int not null,
  isManager boolean not null default 0,
  foreign key (charityId) references Charity(id),
  foreign key (userId) references User(id)
);
