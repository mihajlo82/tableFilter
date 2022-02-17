const express = require('express');
const router = express.Router();
const sql = require('mssql/msnodesqlv8');

const pool = new sql.ConnectionPool({
  database: 'tabler',
  server: "(LocalDb)\\MSSQLLocalDB",
  driver: 'msnodesqlv8',
  options: {
    trustedConnection: true
  }
});

router.get('/', async (req,res)=>{
    let c = JSON.parse(req.query.paramsObj);
    let objForDb= {};
    let isQuery = 0;
    let relQuery = '';
    let queryArr = [];

    for(const [key, val] of Object.entries(c)){
        if(val !=='' && key !== 'startDate' && key !== 'endDate'){
              isQuery++;
              objForDb[key] = val;
              if(key === 'lieferant'){
                let tempQueryRel = `CardName like '%${val}%'`
                relQuery += tempQueryRel;
                queryArr.push(tempQueryRel)
              }else if(key=== 'anzahlNum'){
                let tempQueryRel = `Quantity='${val}'`;
                relQuery += tempQueryRel;
                queryArr.push(tempQueryRel)
              }else if(key=== 'bezahlt'){
                let tempQueryRel;
                console.log('bezzalltt', val)
                switch(val){
                  case '0':
                    isQuery--;
                    break;
                  case '1':
                    console.log('case 1')
                     tempQueryRel = `[dbo].[@BOB_ORDR].ZahlDatum is not null`;
                    relQuery += tempQueryRel;
                    queryArr.push(tempQueryRel);
                    break;
                  case '2':
                    console.log('case 2')
                     tempQueryRel = `[dbo].[@BOB_ORDR].ZahlDatum is null`;
                    relQuery += tempQueryRel;
                    queryArr.push(tempQueryRel);
                    break;
                  default:
                    return;
                }
              }
                else if(key=== 'stock'){
                  let tempQueryRel;
                  console.log('stock', val)
                  switch(val){
                    case '0':
                      isQuery--;
                      break;
                    case '1':
                       tempQueryRel = `onHand > 0`;
                      relQuery += tempQueryRel;
                      queryArr.push(tempQueryRel);
                      break;
                    case '2':
                       tempQueryRel = `onHand <= 0`;
                       relQuery += tempQueryRel;
                       queryArr.push(tempQueryRel);
                      break;
                    default:
                      return;
                  }
              }
        }else if(key === 'startDate' || key === 'endDate'){
            objForDb[key] = val;
        }
      }

  if(objForDb.startDate && objForDb.endDate)
    {
        isQuery++;
        let tempQueryRel = `DocDate between '${objForDb.startDate}' and '${objForDb.endDate}'`;
        relQuery+= tempQueryRel;
        queryArr.push(tempQueryRel); 
    }

    let finalAddQuery ='';
    queryArr.map( (item, index)=> { 
          if(index < queryArr.length-1){
            finalAddQuery += (item+' and ')
          }else if(index == queryArr.length-1){
            finalAddQuery +=item;
          }
        });    

  await pool.connect().then(() => {
      let query =`select RDR1.DocEntry, Dscription, Quantity, Price, LineTotal, VatPrcnt, PriceAfVAT, DocDate, ItemName, OITM.ItemCode, OITM.CardCode,OCRD.CardName, ZahlDatum, onHand from RDR1
            join ORDR on RDR1.DocEntry = ORDR.DocEntry
            join OITM on RDR1.ItemCode = OITM.ItemCode 
            join [dbo].[@BOB_ORDR] on RDR1.DocEntry = [dbo].[@BOB_ORDR].DocEntry
            join OCRD on OITM.CardCode = OCRD.CardCode where OCRD.CardType = 'S'`;

      isQuery ? query+=' and ' + finalAddQuery: '';

      pool.request().query(query, (err, result) => {
          res.send(result.recordset);
          })
      });     
});

module.exports = router;