/* global EVDB */
'use strict';
window.addEventListener('load', function() {
    // Spinner
    let elem = document.querySelector('.loading .ellip');
    let frames = ['', '.', '..', '...'];
    let i = 3,
        timer = 0;
    let intid = setInterval(function() {
        i += 1;
        timer += 1;
        if (i > 3) {
            i = 0;
        }
        elem.innerHTML = frames[i];
        if (timer > 100) {
            clearInterval(intid);
            elem.innerHTML = '...';
        }
    }, 250);

    function getDateAndTime(date_time) {
        // Return a date and time string from the date_time value
        let date = new Date(date_time);
        // console.log(date);
        return [date.toDateString(), date.toTimeString().substr(0, 5)];
    }

    // Band List
    function buildList(events) {
        // Build HTML List
        let html = '';
        for (let i in events) {
            let ev = events[i];
            let performer;
            if(ev.performers.performer instanceof Array){
                // performer = 'no-one';
                let performers = ev.performers.performer;
                performer = performers.reduce(function(performers, performer){
                    return performers += performer.name + ' ';
                }, '');
            }
            else { 
                performer = ev.performers.performer.name;
            }
            let [date, time] = getDateAndTime(ev.date_time);
            html += `<tr>
                    <td>${performer}</td>
                    <td><a href='${ev.venue_url}'>${ev.venue_name}</a></td>
                    <td>${date}</td>
                    <td>${time}</td></tr>\n`;
        }
        return html;
    }

    function updatePage(events) {
        // Update Page
        let list = buildList(events);
        let eventList = document.getElementById('event-list');
        let spinner = document.getElementById('spinner');
        eventList.innerHTML = list;
        spinner.classList.add('hidden');
        eventList.classList.remove('hidden');
    }

    function getThisMonth() {
        // Returns string showing this month
        // e.g. '2016061000-2017062000'
        let date1 = new Date();
        let date2 = new Date();
        date2.setMonth(date2.getMonth() + 2);

        function dateString(date) {
            let dateS = date.toISOString();
            return dateS.substr(0, 4) + dateS.substr(5, 2) + dateS.substr(8, 2) + '00';
        }
        return dateString(date1) + '-' + dateString(date2);
    }

    function sortList(list, sortby) {
        // sorts a list of objects
        var sorted = [];
        while(list.length > 0) {
            let lowest = 0;
            for (let i=1; i<list.length; i++) {
                if (list[i][sortby] < list[lowest][sortby]) lowest = i;
            }
            sorted.push(list[lowest]);
            list.splice(lowest, 1);
        }
        // for (let i in sorted){
        //     console.log(sorted[i][sortby]);
        // }
        return sorted;
    }

    let searchConfig = {
        app_key: 'rtdGfRLtfZrZxWK4',
        q: 'music',
        where: 'Edinburgh, United Kingdom',
        'date': getThisMonth(),
        page_size: 50,
        sort_order: 'popularity',
    };

    EVDB.API.call('/events/search', searchConfig, function(resp) {
        // Get event data.
        let EV = resp.events.event,
            events = [];
        for (let e in EV) {
            let event = EV[e];
            events.push({
                performers: event.performers,
                venue_name: event.venue_name,
                venue_postcode: event.postal_code,
                venue_url: event.venue_url,
                date_time: event.start_time
            });
        }
        // console.log(events);
        // console.log(events[1]);
        console.log(events.length);
        events = events.filter(function(value) {
            return value.performers != null;
        });
        console.log(events.length);
        updatePage(sortList(events, 'date_time'));
    });
});
