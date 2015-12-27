/**
 * Created by ndyumin on 24.12.2015.
 */
'use strict';

require('todomvc-app-css/index.css');

const $ = require('jquery');
const Bacon = require('baconjs');
const rstore = require('rstore').store;

// UTIL

function clone(o) {
    return JSON.parse(JSON.stringify(o));
}

function defineGetter(name) {
    return o => o[name];
}

function defineSetter(name) {
    return (o, v) => {
        const _clone = clone(o);
        _clone[name] = v;
        return _clone;
    };
}

function lens(name) {
    function _lens(getter, setter) {
        return {
            get: getter,
            set: setter,
            toggle: obj => setter(obj, !getter(obj)),
            combine: l => _lens(
                (obj) => l.get(getter(obj)),
                (obj, val) => setter(obj, l.set(getter(obj), val))
            ),
            defineMapSetter: mapper => _lens(
                getter,
                (obj, value) => setter(obj, getter(obj).map(mapper(value)))
            ),
            defineFilterSetter: filter => _lens(
                getter,
                (obj, value) => setter(obj, getter(obj).filter(filter(value)))
            )
        };
    }

    return _lens(defineGetter(name), defineSetter(name));
}

// ACTIONS

const KEY_CODE_ENTER = 13;
const taskAdd$ = $('input.new-todo').asEventStream('keypress')
    .filter(e => e.keyCode === KEY_CODE_ENTER)
    .map(e => $('.new-todo').val());

const clearCompleted$ = $('.clear-completed').asEventStream('click');

const itemClick$ = $('.todo-list').asEventStream('click');

const taskToggle$ = itemClick$
    .filter(e => e.target.tagName === 'INPUT')
    .map((e)=> $(e.target).closest('li').data('id'));

const taskRemove$ = itemClick$
    .filter(e => e.target.tagName === 'BUTTON')
    .map((e)=> $(e.target).closest('li').data('id'));

const filter = () => location.hash.substring(2);
const filter$ = Bacon.fromEvent(window, 'hashchange')
    .map(hash => filter())
    .startWith(filter());

// VIEW

const getVisible = (tasks, filter) => {
    switch (filter) {
        case '':
            return tasks;
        case 'active':
            return tasks.filter(t => !t.done);
        case 'completed':
            return tasks.filter(t => t.done);
    }
};

const render = model => {
    $('.new-todo').val('');
    const html = getVisible(model.tasks, model.filter).map(t =>
        `<li class="${t.done ? 'completed' : ''}" data-id="${t.id}">
                <div class="view">
                    <input class="toggle" type="checkbox" ${t.done ? "checked" : ""}>
                    <label>${t.name}</label>
                    <button class="destroy"></button>
                </div>
            </li>`
    ).join('');
    $('.footer')
        .find('a')
        .removeClass('selected')
        .filter('[href="#/' + model.filter + '"]')
        .addClass('selected');

    $('.main').find('ul').html(html);
    const todo = model.tasks.length - model.tasks.filter(t => t.done).length;
    $('.todo-count').find('strong').text(todo);
};

// STORE

const model = rstore({
    maxId: 1,
    filter: '',
    tasks: [
        {name: 'test the rstore', id: 0, done: false},
        {name: 'write a todo app', id: 1, done: true}
    ]
});

// DISPATCHERS

const filterL = lens('filter');
const tasksL = lens('tasks');
const doneL = lens('done');

const removeByIdL = tasksL
    .defineFilterSetter(action => task => task.id !== action);

const removeCompletedL = tasksL
    .defineFilterSetter(action => task => !task.done);

const toggleL = tasksL
    .defineMapSetter(action => task => task.id === action ? doneL.toggle(task) : task);

model
    .plug(taskRemove$, removeByIdL.set)
    .plug(clearCompleted$, removeCompletedL.set)
    .plug(taskAdd$, (s, a) => {
        const o = clone(s);
        o.tasks = o.tasks.concat({
            name: a,
            id: ++o.maxId,
            done: false
        });
        return o;
    })
    .plug(taskToggle$, toggleL.set)
    .plug(filter$, filterL.set)
    .stream().onValue(render);