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


## История по дням:
* InvestoPoolHistory
* InvestHistory
* DivestHistory
* ExchangeHistory
* ProposalSupplyHistory 
* ProposalWithdrawalHistory
* ProposalInvestHistory
* ProposalDivestHistory

## История по 100 блоков:
* BasicPoolPriceHistory

## Запросы

### Поиск по имени:

    {
        basicPools(where: {name: <string>}) {
            id
            baseToken
            ticker
            name
            creatingTime
            investors
        }
      }

### Поиск по тикеру:

    {
        basicPools(where: {ticker: <string>}) {
            id
            baseToken
            ticker
            name
            creatingTime
            investors
        }
      }

### Поиск по адресу:

    {
        basicPool(id: <string>){ # string is pool address
            id
            baseToken
            ticker
            name
            creatingTime
            investors
        }
    }

### PNL количества инвесторов:

    {
        basicPoolHistory(where{day: <BigInt>,pool:<string>}){
            investors
        }
    }

* investors это массив адресов ивесторов, что б получить кол-во нужно получить длинну

### Дата создания фонда:

    {
        basicPool(id:<string>){
            creatingTime
        }
    }

### Список закрытых позиций:

    {
        positions(where: {basicPool: <string>, closed: <boolean>}){
            positionToken
            totalOpenVolume
            totalCloseVolume
            exchanges
        }
    }

### Trades per day:

    {
        exchangeHistories(orderBy:day, orderDirection:desc,where: {basicPool: <string>},first:5){
            exchanges
        }
    }

### Daily profit:

    {
        basicPoolPriceHistories(where: {basicPool:<string>, seconds_gte:<BigInt>}){
            price
            supply
            poolBase
        }
    }

* в seconds_gte ввести timestamp дня до которого будет считаться средний профит. Например если средний профит считается за неделю, то в seconds_gte нужно ввести: current_timestamp/86400 - 86400*7

### time positions:

    {
        positions(where: {closed: true, basicPool: <string>}){
            liveTime
        }
    }

### trades:

    {
        basicPool(id:<string>){
            exchanges
        }
    }

* exchanges это массив, чтоб получить кол-во, нужно взять его длинну

### PNL:

    {
        basicPoolPriceHistories(orderBy: seconds, orderDirection:desc, where(pool:<string>),first:1){
            price
            supply
            poolBase
        }
    }

    {
        basicPoolPriceHistories(orderBy: seconds, orderDirection:asc, where(pool:<string>),first:1){
            price
            supply
            poolBase
        }
    }

* Получаем последнее и первое значения стоимости пула.

### PNL за период времени:

    {
        basicPoolPriceHistories(where:{seconds_gte: <BigInt>,pool:<string>},orderBy: seconds, orderDirection:asc){
            price
            supply
            poolBase
        }
    }

* В seconds_gte ввести timestamp дня до которого будет считаться средний профит. Например если PNLсчитается за неделю, то в seconds_gte нужно ввести: current_timestamp/86400 - 86400*7

### Изменение цены фонда:

    {
        basicPoolPriceHistories{
            price
            supply
            poolBase
        }
    }

### Order size:

    {
        positions{
            totalOpenVolume
        }
    }

### Пулы по убыванию по времени создания:

    {
        basicPools(orderBy:creatingTime, orderDirection:asc,first:<BigInt>, skip:<BigInt>){
            investors
            proposals
            positions
            invests
            divests
        }
    }

### Список открытых инвестиций:

    {
        investor(id:<string>){
            activePools
        }
    }

### Список всех пулов пользователя:

    {
        investor(id:<string>){
            allPools
        }    
    }

### Max loss:

    {
        basicPoolPriceHistory(orderBy: loss, orderDirection: desc,where:{pool:<string>},first:1){
            loss
        }
    }
