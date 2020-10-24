A prototype web application built on the MEAN stack that provides an online service for aggriculture management with a built in store.

Frontend: HTML 5, CSS 3, JS (EcmaScript 2016+ standard), Angular 10, Boostrap 4

Backend: NodeJS 14, Express.JS

Database: MongoDB 4

Description:

The app is divided into two distinct parts - the guest pages (Login/Register) and the user pages (the actual service). There are three different kinds of users - Admin, Worker and Company. Admin users manage all the users of the app (Add, Remove, Edit details) and approve registration of new users. 

Worker users can create multiple hothouses in which they can plant seedlings and monitor their progress as they grow in real time, as well as speed up the process using fertilizers. Worker users have access to an online store where they can order seedlings and fertilizers, as well as monitor the status of their orders. Worker users have control over each hothouse parameter (temperature and water supply) that degrade over time and require user intervention when they become undesirable. A notification is sent both in the app and as an email to the Worker user whenever the conditions get poor in any of the user's hothouses.

Company users manage items and deliveries of a registered company. This user can manage the company's products (seedlings and fertilizers) on the online store - publish new products, remove old products and view the details of all products such as Worker user feedback (comments and ratings) on the store. This user also has to approve all orders made for the company's products and monitors the progress of deliveries. Each company has by default a max of 5 delivery agents available. The delivery time is calculated using the TomTom Maps API: https://developer.tomtom.com/.
 
Developed by Mihajlo Starčević, School of Electrical Engineering, University of Belgrade, 2020.
