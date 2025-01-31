const express = require('express')
const app = express()
const port = 3000
const db = require('./fake-wiki-db');
const bodyParser = require('body-parser');
const path = require('path');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    const articles = db.article_getRandoms(5);
    res.render('index', { articles });
});

app.get('/article/:articlename', (req, res) => {
    try {
        const article = db.article_getByEncodedName(req.params.articlename);
        res.render('article', { article });
    } catch (error) {
        res.status(404).send('Article not found');
    }
});

app.get('/article/:articlename/edit', (req, res) => {
    try {
        const article = db.article_getByEncodedName(req.params.articlename);
        res.render('edit', { article });
    } catch (error) {
        res.status(404).send('Article not found');
    }
});

app.post('/article/:articlename/edit', (req, res) => {
    try {
        const { contents } = req.body;
        db.article_editByEncodedName(req.params.articlename, contents);
        res.redirect(`/article/${req.params.articlename}`);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

app.get('/article/:articlename/delete', (req, res) => {
    try {
        const article = db.article_getByEncodedName(req.params.articlename);
        res.render('delete', { article });
    } catch (error) {
        res.status(404).send('Article not found');
    }
});

app.post('/article/:articlename/delete', (req, res) => {
    try {
        db.article_deleteByEncodedName(req.params.articlename);
        res.redirect('/');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

app.get('/newarticle', (req, res) => {
    res.render('newarticle');
});

app.post('/newarticle', (req, res) => {
    const { name, contents } = req.body;
    if (!name || !contents) {
        return res.status(400).send('Name and content are required');
    }
    try {
        const article = db.article_create(name, contents);
        res.redirect(`/article/${article.code_name}`);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

app.get('/search', (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.redirect('/');
    }
    const terms = query.split(' ').filter(term => term.length > 0);
    const results = db.article_searchByTerms(terms);
    res.render('search', { query, results });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});