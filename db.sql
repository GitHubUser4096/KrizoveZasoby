--- Create Database (don't execute if you already have a database) ---
create database EmergencySupplies;
use EmergencySupplies;

--- Tables (new) ---

create table User(
  id int primary key auto_increment,
  email varchar(64) not null unique,
  password varchar(255) not null
);

create table Bag(
  id int primary key auto_increment,
  name varchar(64) not null,
  description varchar(1024),
  userId int not null,
  handedOut boolean not null default 0,
  handedOutDate datetime,
  foreign key (userId) references User(id)
);

create table Brand(
  id int primary key auto_increment,
  name varchar(64) not null unique
);

create table ProductType(
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
  typeId int not null,
  shortDesc varchar(128) not null,
  code varchar(64) not null unique,
  imgName varchar(64),
  packageTypeId int,
  description varchar(1024),
  amountValue int,
  amountUnit enum('g', 'ml') default 'g',
  foreign key (brandId) references Brand(id),
  foreign key (typeId) references ProductType(id),
  foreign key (packageTypeId) references PackageType(id)
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
  itemDisplay enum('brandFirst', 'typeFirst') default 'brandFirst',
  sort enum('date', 'name') default 'date'
);

--- Tables - OLD DATABASE ---

create table User(
  id int primary key auto_increment,
  email varchar(64) not null unique,
  password varchar(255) not null
);

create table Bag(
  id int primary key auto_increment,
  name varchar(64) not null,
  description varchar(1024),
  userId int not null,
  handedOut boolean not null default 0,
  handedOutDate datetime,
  foreign key (userId) references User(id)
);

create table PackageType(
  id int primary key auto_increment,
  name varchar(30) not null unique
);

create table Category(
  id int primary key auto_increment,
  name varchar(30) not null unique
);

create table ProductCategory(
  id int primary key auto_increment,
  productId int not null,
  categoryId int not null,
  foreign key (productId) references Product(id),
  foreign key (categoryId) references Category(id)
);

create table Product(
  id int primary key auto_increment,
  name varchar(99) unique not null,
  EAN varchar(13) unique not null,
  imgName varchar(50),
  description varchar(1024),
  packageTypeId int,
  foreign key (packageTypeId) references PackageType(id)
);

create table Item(
  id int primary key auto_increment,
  count int not null,
  used tinyint(1) not null default 0,
  expiration date,
  productId int not null,
  bagId int not null,
  foreign key (productId) references Product(id),
  foreign key (bagId) references Bag(id)
);

create table Charity(
  id int primary key auto_increment,
  name varchar(99),
  contact varchar(255),
  address varchar(255),
  notes varchar(1024)
);

create table Config(
  id int primary key auto_increment,
  name varchar(32),
  value varchar(255),
  userId int,
  foreign key (userId) references User(id)
);

--- Update to V0.1 (OLD DATABASE) ---
alter table Bag add column handedOut boolean not null default 0;
alter table Bag add column handedOutDate datetime;

--- Test data (OLD DATABASE) ---
insert into User(email, password) values ('admin', '$2y$10$kWjwlTwT8V6/SedjOHZvUudfAYKYLVNobSHO1Pma8sQv3oAJJxYDC');
insert into Bag(name, userId) values ('bag1', 1);
insert into Bag(name, userId) values ('bag2', 1);
insert into Product(name) values ('Heinz Beans');
insert into Product(name) values ('Pasta Snack Pot');
insert into Item(count, expiration, productId, bagId) values (3, '2024-04-10', 1, 1);
insert into Item(count, expiration, productId, bagId) values (2, '2022-10-03', 2, 2);
insert into Category(name) values ('Konzervy');
insert into PackageType(name) values ('Konzerva');
insert into Charity(name, contact, address, notes) values ('Generic Charity', 'John Doe, johndoe@mail.com, 789123456', 'Evropská 1, Praha 6', '');
