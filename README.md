# Deploying guide
Перед деплоем необходимо создать граф [тут](https://thegraph.com/hosted-service/dashboard), выполнить все шаги, предложенные сервисом, исключая

    graph init

Далее необходимо заменить:
* адреса в файле subgraph.yaml в строках 

        dataSoures > kind > source > address

* номер блока, с которого будет начинаться идексация

        dataSoures > kind > source > startBlock

* название сети в строках
        
        dataSoures > kind > network

* поменять адреса на актуальные в файле

        src/entities/globals/globals.ts

Для начала деплоинга необходимо выполнить

    graph deploy <USER_NAME>/<SUBGRAPH_NAME>

# Общие сведения о the graph
Для Querying из приложения [предлагаются](https://thegraph.com/docs/en/developer/querying-from-your-app) пакеты: apollo client и URQL, также необходимо установить пакет graphql.

    npm install @apollo/client graphql

(или)

    npm install urql graphql

Для bsc нужно делать запрос на graph explorer:

    https://api.thegraph.com/subgraphs/name/<USER_NAME>/<SUBGRAPH_NAME>

Запрос в общем виде выглядит так:

    {
        Entities(arg: value){
            field1
            field2
        }
    }

Если одно из полей имеет тип Entity, его нужно расписать по тому же принципу:

    {
        Entities(arg: value){
            field1
            field2{
                field1
            }
        }
    }

Если аргументов нет - нужно писать без ().

Больше примеров [тут](https://thegraph.com/docs/en/developer/graphql-api/).