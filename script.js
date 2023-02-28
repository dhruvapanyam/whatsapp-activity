const bgcolours = [
    'rgba(54, 162, 235, 0.8)',
    'rgba(255, 206, 86, 0.8)',
    'rgba(255, 99, 132, 0.8)',
    'rgba(75, 192, 192, 0.8)',
    'rgba(153, 102, 255, 0.8)',
    'rgba(255, 159, 64, 0.8)'    
]

const top3colours = [
    'rgba(255,206,86,0.9)',
    'rgba(100,100,100,0.9)',
    'rgba(225,127,80,0.9)',
]

const blankcolour = 'rgba(200,200,200,0.3)'

function makeOpacity(o,col){
    spl = col.split(',')
    return spl[0]+','+spl[1]+','+spl[2]+','+String(o)+')'
}

const brcolours = [
    'rgba(54, 162, 235, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(255, 99, 132, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(255, 159, 64, 1)',
]

var chat
document.getElementById('inputfile') 
    .addEventListener('change', function() { 
        
    var fr=new FileReader(); 
    fr.readAsText(this.files[0]);
    groupName = this.files[0].name
    fr.onload=function(e){
        // console.log(groupName) 
        chat = fr.result;
        // document.getElementById('output') 
        //         .textContent=fr.result.length;

        startAnalysis(groupName)
    } 
        
    
}) 

const days_per_month = [null,31,28,31,30,31,30,31,31,30,31,30,31]

function addOneToDate(d){
    arr = d.split('/').map(x=>parseInt(x))
    arr[0] += 1
    if(arr[0]>days_per_month[arr[1]]){
        arr[0] = 1
        arr[1] += 1
        if(arr[1]>12){
            arr[1] = 1
            arr[2] += 1
        }
    }
    arr = arr.map(x=>String(x))
    if(arr[0].length<2) arr[0] = '0'+arr[0] 
    if(arr[1].length<2) arr[1] = '0'+arr[1] 
    return arr[0]+'/'+arr[1]+'/'+arr[2]
}

function prevDate(d){
    arr = d.split('/').map(x=>parseInt(x))
    arr[0] -= 1
    if(arr[0]==0){
        arr[1] -= 1
        if(arr[1]==0){
            arr[1] = 12
            arr[2] -= 1
        }
        arr[0] = days_per_month[arr[1]]
    }
    arr = arr.map(x=>String(x))
    if(arr[0].length<2) arr[0] = '0'+arr[0] 
    if(arr[1].length<2) arr[1] = '0'+arr[1] 
    return arr[0]+'/'+arr[1]+'/'+arr[2]
}

message_regex = /\d{2}\/\d{2}\/\d{4}, \d+:\d+ [ap]m - [a-zA-Z 0-9+]+:/g
word_regex = /\d{2}\/\d{2}\/\d{4}, \d+:\d+ [ap]m - [a-zA-Z 0-9+]+: ([\s\S]*?)\d{2}\/\d{2}\/\d{4}, \d+:\d+ [ap]m - [a-zA-Z 0-9+]+: /g
date_regex = /\d{2}\/\d{2}\/\d{4}/g
    

// const start_date = '30/11/2019'
// const end_date = '28/11/2020'

const omit_members = new Set(['Ravitha'])

// const members = {'+33 7 49 35 94 20':0,'Akshaya':0,'Anjali Dalmia':1,'Dhruva Panyam':2,'Hari':3,'Nishant':4,'Parul Joshi':5,'Rasika':6,'Rathi':7,'Rishy':8,'Rohan Manoj':9,'Uttara':10,'Vidur':11}
members = {}

current_people = []


function startAnalysis(group){

    myChart.options.title.text = 'Time Animations - '+group

    dates = chat.match(date_regex)
    const start_date = prevDate(dates[0])
    const end_date = addOneToDate(dates[dates.length-1])

    // console.log(start_date,end_date)

    // test = chat.substring(100000,120000)
    
    msgs = chat.match(message_regex)
    words = chat.match(word_regex)
    // console.log(msgs.length)


    // Find all members..
    for(i=0;i<msgs.length;i++){
        person = msgs[i].substring(0,msgs[i].length-1).split(' - ')[1]
        if(person in members == false){
            members[person] = 1
        }
    }

    alphabetical = Object.keys(members).sort()
    for(i=0;i<alphabetical.length;i++) members[alphabetical[i]] = i

    myChart.data.labels = alphabetical

    // console.log(members)

    myChart.data.datasets[0].backgroundColor = alphabetical.map((x,i)=>bgcolours[i%6])
    myChart.data.datasets[0].borderColor = alphabetical.map((x,i)=>brcolours[i%6])

    myChart.data.datasets[1].backgroundColor = alphabetical.map((x,i)=>makeOpacity(0.2,bgcolours[i%6]))
    myChart.data.datasets[1].borderColor = alphabetical.map((x,i)=>makeOpacity(0.7,brcolours[i%6]))

    filt = document.getElementById('filter-content')
    filt.innerHTML = ''
    for(i=0;i<alphabetical.length;i++){
        filt.innerHTML += '<input name="'+alphabetical[i]+'" type="checkbox" onchange="filterPerson(this.name,this.checked)" checked="true"><label for="'+alphabetical[i]+'">'+alphabetical[i]+'</label><br>'
    }

    // console.log(filt.innerHTML)

    current_people = alphabetical.map((x,i)=>1)

    //-------------------------

    msg_counts = {}
    msg_counts[start_date] = {}
    word_counts = {}
    word_counts[start_date] = {}
    for(person of Object.keys(members)) msg_counts[start_date][person] = 0
    for(person of Object.keys(members)) word_counts[start_date][person] = 0
    // console.log(msg_counts)
    
    prevDt = start_date
    for(i=0;i<msgs.length;i++){
        // console.log(i)
        dt = msgs[i].match(date_regex)[0]
        // console.log(dt)
        if(!(dt in msg_counts)) {msg_counts[dt] = {...msg_counts[prevDt]}; prevDt = dt}
        person = msgs[i].substring(0,msgs[i].length-1).split(' - ')[1]
        if(person in members) msg_counts[dt][person] += 1

        // console.log(msgs[i])
    }

    prevDt = start_date
    for(i=0;i<words.length;i++){
        dt = words[i].match(date_regex)[0]
        if(!(dt in word_counts)) {word_counts[dt] = {...word_counts[prevDt]}; prevDt = dt}
        meta = words[i].match(message_regex)[0]
        person = meta.substring(0,meta.length-1).split(' - ')[1]

        text = words[i].split(message_regex)[1]
        // console.log(person)
        num_words = text.match(/[^\s]+/g).length
        // console.log(text)
        if(person in members) word_counts[dt][person] += num_words


    }
    final_words = [{}]
    final_words[0] = {date:start_date,count:[0,0,0,0,0,0,0,0,0,0,0,0]}
    final_messages = [{}]
    final_messages[0] = {date:start_date,count:[0,0,0,0,0,0,0,0,0,0,0,0]}
    for(cur_date=start_date,i=1;cur_date!=end_date;cur_date=addOneToDate(cur_date),i++){
        final_messages[i] = {}
        final_messages[i].date = cur_date
        final_messages[i].count=final_messages[i-1].count.slice()
        if(cur_date in msg_counts == false){
            continue
        }
        else{
            // console.log(msg_counts[cur_date])
            for(person of Object.keys(msg_counts[cur_date])){
                final_messages[i].count[members[person]] = msg_counts[cur_date][person]
            }
        }

    }
    for(cur_date=start_date,i=1;cur_date!=end_date;cur_date=addOneToDate(cur_date),i++){
        final_words[i] = {}
        final_words[i].date = cur_date
        final_words[i].count=final_words[i-1].count.slice()
        if(cur_date in word_counts == false){
            continue
        }
        else{
            // console.log(msg_counts[cur_date])
            for(person of Object.keys(word_counts[cur_date])){
                final_words[i].count[members[person]] = word_counts[cur_date][person]
            }
        }

    }

    // console.log(final_values)

    changeGraph(graphType)

    // final_values = final_messages

    // myChart.data.datasets[1].data = final_values[final_values.length-1].count
    // myChart.update()
    document.getElementById('dateSlider').max = parseInt(final_values.length)-1
    document.getElementById('dateValue').innerHTML = start_date
    document.getElementById('speedValue').innerHTML = 5

    // animate = setInterval(function(){updateSlider()},100)

    
}

var graphType = 'messages'

var ctx = document.getElementById('myChart').getContext('2d');
var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [{
            label: '# of messages as per 29/11/2019',
            data: [0,0,0,0,0,0,0,0,0,0,0,0],
            backgroundColor: [

            ],
            borderColor: [
                
               
            ],
            borderWidth: 3
        },
        {
            label: 'Total # of messages',
            data: [0,0,0,0,0,0,0,0,0,0,0,0],
            backgroundColor: [
                
            ],
            borderColor: [
                
            ],
            borderWidth: 1.5
        }
    
    ]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                    max:10000
                }
            }],
            
        },
        title: {
            display: true,
            text: 'Time Animations'
        },
        responsive: false,
        "animation": {
            "duration":700,
            "easing":'easeOutElastic',
            "onProgress": function() {
                if(document.getElementById('numbers').checked==false) return
              var chartInstance = this.chart,
                ctx = chartInstance.ctx;
      
              ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontSize, Chart.defaults.global.defaultFontStyle, Chart.defaults.global.defaultFontFamily);
              ctx.textAlign = 'center';
              ctx.textBaseline = 'bottom';
              gd = document.getElementById('proportion'.checked)
              s = gd?'%':''
      
              this.data.datasets.forEach(function(dataset, i) {
                  if(!(i==1 && document.getElementById('totals').checked==false)){
                    var meta = chartInstance.controller.getDatasetMeta(i);
                    meta.data.forEach(function(bar, index) {
                    var data = String(dataset.data[index])+s;
                    ctx.fillText(data, bar._model.x, bar._model.y - 5);
                    });
                }
              });
            }
          
    }
    }
});

function filterPerson(name,checked){
    val = checked ? 1 : 0
    current_people[members[name]] = val
    myChart.data.labels = alphabetical.filter((x,i)=>{
        return current_people[i]==1
    })
    myChart.data.datasets[1].data = final_values[final_values.length-1].count.filter((a,i)=>{return current_people[i]==1})
    myChart.update()
    animateTo()
}

var animate;

// speeds = {1:1000,2:500,3:350,4:200,5:100,6:75,7:55,8:35,9:20,10:10}
function speeds(x){
    return 1000/(x*(x+1));
}

function updateSlider(playing=true){
        // console.log('update')
        slider = document.getElementById('dateSlider')
    // console.log(slider.value)
    if(playing) slider.value = parseInt(slider.value)+1
    if(slider.value == slider.max) {
        // document.getElementById('speedSlider').value = 0
        // togglePlay(false)
        return
    }
    x = parseInt(slider.value)
    animateTo(x)
}

d = document.getElementById('dateSlider')
d.addEventListener('input',function(){
    animateTo(d.value)
    // document.getElementById('dateValue').innerHTML = final_values[d.value].date
})

// setInterval(play,10)

// cur_speed = document.getElementById('speedSlider')
function togglePlay(p,s=false){
    // console.log('hey')
    document.getElementById('play').checked = p
    speed = parseInt(document.getElementById('speedSlider').value)
    // console.log(speed)
    if(!p) clearInterval(animate)
    else{
        if(s) clearInterval(animate)
        if(speed==0) clearInterval(animate)
        else{
            animate = setInterval(updateSlider,speeds(speed))
        }
    }
}


function changeGraph(type){
    gd = document.getElementById('proportion').checked
    s = gd ? '%' : '#'
    if(type=='words'){
        final_values = final_words
        graphType = type
        myChart.data.datasets[1].data = final_values[final_values.length-1].count.filter((a,i)=>{return current_people[i]==1})
        
        myChart.data.datasets[1].label = 'Total '+s+' of words'
        animateTo(document.getElementById('dateSlider').value)
        myChart.options.scales.yAxes[0].ticks.max = Math.round(Math.max(...final_values[final_values.length-1].count)*1.1)
        myChart.update()
    }
    else if(type=='messages'){
        final_values = final_messages
        graphType = type
        myChart.data.datasets[1].data = final_values[final_values.length-1].count.filter((a,i)=>{return current_people[i]==1})
        myChart.data.datasets[1].label = 'Total '+s+' of messages'
        animateTo(document.getElementById('dateSlider').value)
        myChart.options.scales.yAxes[0].ticks.max = Math.round(Math.max(...final_values[final_values.length-1].count)*1.1)
        myChart.update()
    }
}

function changeGraphData(type){
    gd = graphType
    nums = final_values[final_values.length-1].count.filter((a,i)=>{return current_people[i]==1})
    if(type=='count'){
        myChart.data.datasets[1].data = nums
        myChart.options.scales.yAxes[0].ticks.max = Math.round(Math.max(...nums)*1.1)
        myChart.data.datasets[1].label = 'Total # of '+gt
        myChart.update()
    }
    else{
        s = nums.reduce((a,b)=>a+b,0)
        nums = nums.map(x=>Math.round(x*10000/s)/100)
        myChart.data.datasets[1].data = nums
        myChart.options.scales.yAxes[0].ticks.max = Math.round(Math.max(...nums)*1.5)
        myChart.data.datasets[1].label = 'Total % of '+gt
        myChart.update()
    }
    animateTo()
}





// function changeSpeed(){
//     clearInterval(animate)
//     if(x==0)
//         return;
//     if(document.getElementById('play').checked) animate = setInterval(updateSlider,speeds(x))
// }

function getPositionsArray(arr){
    res = []
    for(i=0;i<arr.length;i++)res.push([arr[i],i])
    for(i=0;i<res.length;i++){
        for(j=i+1;j<res.length;j++){
            if(res[j][0]>res[i][0]){
                temp = res[j].slice()
                res[j] = res[i].slice()
                res[i] = temp
            }
        }
    }
    return res.map(x=>x[1])
}

// console.log(getPositionsArray([1,2,3,4,5]))

function updateOnce(){
    x = document.getElementById('dateSlider').value
    animateTo(x)
    // changeSpeed(parseInt(document.getElementById('speedSlider').value))
}

function animateTo(x=document.getElementById('dateSlider').value){
    x = parseInt(x)
    // console.log(x)
    document.getElementById('dateValue').innerHTML = final_values[x].date
    if(x<final_values.length){
        nums = final_values[x].count.filter((a,i)=>{return current_people[i]==1})
        if(document.getElementById('proportion').checked == false)
            myChart.data.datasets[0].data = nums
        else{
            s = nums.reduce((a, b) => a + b, 0)
            nums = nums.map(x=>Math.round(x*10000/s)/100)
            myChart.data.datasets[0].data = nums
        }

        

        if(document.getElementById('top3').checked){
            pos = getPositionsArray(nums)
            for(i=0;i<3;i++) myChart.data.datasets[0].backgroundColor[pos[i]] = top3colours[i]
            for(i=3;i<pos.length;i++) myChart.data.datasets[0].backgroundColor[pos[i]] = blankcolour
            
            for(i=0;i<3;i++) myChart.data.datasets[0].borderColor[pos[i]] = makeOpacity(1,top3colours[i])
            for(i=3;i<pos.length;i++) myChart.data.datasets[0].borderColor[pos[i]] = blankcolour

            myChart.data.datasets[1].backgroundColor = Object.keys(members).map((x,i)=>makeOpacity(0.2,blankcolour))
            myChart.data.datasets[1].borderColor = Object.keys(members).map((x,i)=>makeOpacity(0.7,blankcolour))

        }
        else{
            myChart.data.datasets[0].backgroundColor = Object.keys(members).map((x,i)=>bgcolours[i%6])
            myChart.data.datasets[0].borderColor = Object.keys(members).map((x,i)=>brcolours[i%6])

            myChart.data.datasets[1].backgroundColor = Object.keys(members).map((x,i)=>makeOpacity(0.2,bgcolours[i%6]))
            myChart.data.datasets[1].borderColor = Object.keys(members).map((x,i)=>makeOpacity(0.7,brcolours[i%6]))

        }

        if(document.getElementById('totals').checked)
            myChart.data.datasets[1].hidden=false
        else
            myChart.data.datasets[1].hidden=true


        gd = document.getElementById('proportion').checked
        s = gd ? '%' : '#'
        gt = graphType
        myChart.data.datasets[0].label = s+' of '+gt+' as per '+final_values[x].date
        myChart.update()
    }
}