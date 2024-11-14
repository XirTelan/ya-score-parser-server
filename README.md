# Server
## Стек
fastify
MongoDB(mongoose)
cheerio

## env variables
содержимое для .env 
```
DOMAIN_URL=
MONGODB_URI=
```



# Client
 ![image](https://github.com/user-attachments/assets/06ca6bfa-43ea-408a-9983-df23d10e4947)
 
## Стек
Vite
shadcn/ui
tailwind

## env variables
Единственная переменная - это url самого серва
```
VITE_BACKEND_URL=http://127.0.0.1:3000
```

Gui для настройки серва. 

## Session Id
Необходим для парсинга. 
Берем Session_id из раздела cookies браузера открыв страницу любого контеста.
Парсинг возможен если аккаунт  участвует в этот контесте. 

##  Контесты
Добовляем контесты
 1. Указываем id контеста.
 2. Отобразаемое название
 3. Автообновление в минутах (0 - отключено)
 4. для каких задач считать попытки. Указываются через запятую.
