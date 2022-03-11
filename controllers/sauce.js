const Sauce = require('../models/sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    sauce.save()
        .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
        .catch(error => res.status(400).json({ error }));
};


exports.modifySauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })   
        .then((sauce) => {

            if (!sauce) {
                res.status(404).json({
                    error: 'Sauce introuvable!'
                });
                return
            }
            if (sauce.userId !== res.locals.auth.userId) {

                res.status(401).json({
                    error: 'Requête non autorisée!'
                });
                return
            }

           let sauceObject;

            if (req.file) {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`,function(err){
                    if(err) return console.log(err);
                    console.log('fichier supprimé avec succès');
                });

                sauceObject = {
                    ...JSON.parse(req.body.sauce),
                    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
                }
            }
            else {
                sauceObject = { ...req.body }
            }

            Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                .then(() => res.status(200).json({ message: 'Objet modifié !'}))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
        
};


exports.likeSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {

            let successMsg = "";

            if(req.body.like === 1) {

                if(!sauce.usersLiked.includes(res.locals.auth.userId) && !sauce.usersDisliked.includes(res.locals.auth.userId)) {
                    sauce.likes++;
                    sauce.usersLiked.push(res.locals.auth.userId);
                    successMsg = "Like ajouté";
                } 

                else if(sauce.usersDisliked.includes(res.locals.auth.userId)) {
                    sauce.dislikes--;
                    sauce.usersDisliked.pull(res.locals.auth.userId);
                    sauce.likes++;
                    sauce.usersLiked.push(res.locals.auth.userId);
                    successMsg = "Dislike retiré et Like ajouté";                   
                }
            } 
            
            else if(req.body.like === -1) {

                if(!sauce.usersLiked.includes(res.locals.auth.userId) && !sauce.usersDisliked.includes(res.locals.auth.userId)) {
                    sauce.dislikes++;
                    sauce.usersDisliked.push(res.locals.auth.userId);
                    successMsg = "Dislike ajouté";
                } 

                else if(sauce.usersLiked.includes(res.locals.auth.userId)) {       
                    sauce.likes--;
                    sauce.usersLiked.pull(res.locals.auth.userId);
                    sauce.dislikes++;
                    sauce.usersDisliked.push(res.locals.auth.userId);
                    successMsg = "Like retiré et Dislike ajouté";
                }
            } 

            else if (req.body.like === 0) {
                
                if(sauce.usersLiked.includes(res.locals.auth.userId)) {
                    sauce.likes--;
                    sauce.usersLiked.pull(res.locals.auth.userId);
                    successMsg = "Like retiré";                  
                }

                else if(sauce.usersDisliked.includes(res.locals.auth.userId)) {
                    sauce.dislikes--;
                    sauce.usersDisliked.pull(res.locals.auth.userId);
                    successMsg = "Dislike retiré";
                }
            }

            Sauce.updateOne({ _id: req.params.id }, { likes: sauce.likes, dislikes: sauce.dislikes, usersLiked: sauce.usersLiked, usersDisliked: sauce.usersDisliked, _id: req.params.id })
                .then(() => res.status(200).json({ message: successMsg }))
                .catch(error => res.status(400).json({ error }));

        })
        .catch(error => res.status(500).json({ error })); 
};


exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
    
        .then((sauce) => {

            if (!sauce) {
                res.status(404).json({
                    error: 'Sauce introuvable!'
                });
                return
            }
            if (sauce.userId !== res.locals.auth.userId) {

                res.status(401).json({
                    error: 'Requête non autorisée!'
                });
                return
            }
                
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Sauce supprimée !'}))
                    .catch(error => res.status(400).json({ error }));
            });
        })
        .catch(error => res.status(500).json({ error }));
};


exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }));
};


exports.getAllSauce = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json( sauces ))
        .catch(error => res.status(404).json({ error }));
};