/*
* Ту ду
* Обработка ошибки при запросе тизеров
* Обработка когда не возвращено ниодного тизера
*
* */

(function($) {
    $(document).ready(function(){
        var $tizerContainer = $('#tizer-container'),
            tizerContainerW = $tizerContainer.outerWidth(true),
            tizerCount,
            tizerWidth,
            $tizers,
            tizersAll = {},
            defaultTizerLink = 'tizers.php',
            addtext = "Добавить в проект",
            deltext = "Убрать из проекта",
            inProcess = false,
            $tizerPreloader = $('#tizer-preloader'),
            $tizerTemplate = $('#tizerTemplate'),
            $tizerMoreTemplate = $('#tizerMoreTemplate'),
            $tizerBar = $('.b-tizer-bar');

        getTizers(addTizers);

        /*
        * Снимает выделение со всего списка в фильтре
        * */
        $('.b-fexpand__l-unselect').click(function(){
            var parent = $(this).closest(".b-fexpand__list");
            $('.b-fexpand__checkbox', parent).prop('checked', false);
        });

        /*
        * Добавляет обводку на блоке поиска при фокусе
        * */
        $('.b-search__field').focus(function(){
            $(this).parent().addClass('focus');
        }).blur(function(){
            $(this).parent().removeClass('focus');
        });

        /*
        * Подсказки для меню пользователя
        * */
        $('.b-umenu__link').tooltip({ position: { my: "center top", at: "center top-28px" } });

        /*
        * Подгрузка тизеров при скроле
        * */
        $(window).scroll(function() {
            if($(window).scrollTop() + $(window).height() + 200 >= $(document).height() && !inProcess) {
                getTizers(addTizers);
            }
        });

        /*
        * Раскрытие расшириного фильтра
        * */
        $('.js-open_filter').click(function(){
            var filter = $('.js-expanded_filter');
            if(filter.hasClass('open')){
                filter.slideUp('fast', function(){
                    filter.removeClass('open');
                });
            } else {
                filter.slideDown('fast', function(){
                    filter.addClass('open');
                });
            }
            return false;
        });

        /*
        *Открытие списка быстрого фильтра
        * */
        $('.b-filter__item').click(function(){
            var dropdown = $('.b-filter__dropdown', this);
            if(dropdown.hasClass('open')){
                dropdown.stop().animate({
                    opacity:0
                }, 300, function(){
                    $(this).removeClass('open').css("display", "none");
                });
            } else {
                $('.b-filter__dropdown').animate({
                    opacity:0
                }, 100, function(){
                    $(this).removeClass('open').css("display", "none");

                    dropdown.css("display", "block").stop().animate({
                        opacity:1
                    }, 300, function(){
                        $(this).addClass('open');
                    });
                });
            }
            return false;
        });

        /*
        * Клик по элементу быстрого фильтра
        *
        * @todo Здесь нужно сделать отправку запроса для получения
        * новых(отфильтрованых) тизеров.
        * */
        $('.b-filter__dropdown-item').click(function(){
            var value = $(this).data('val');
            var parent = $(this).closest('.b-filter__item');
            var text = $(this).html();
            var target = $(".arrow", parent);
            var dropdown = $('.b-filter__dropdown', parent);

            dropdown.stop().animate({
                opacity:0
            }, 300, function(){
                $(this).removeClass('open').css("display", "none");
            });

            $("<a class=\"value\" href=\"#\">"+text+"</a>").insertBefore(target);

            /*
            * в этом месте вставить отправку.
            * getTizers(addTizers, '', true, "","","","get object");
            * Или может вместо объекта с гет параметрам подставлять строку?
            *
            * */

            return false;
        });

        /*
        * Отправка формы расширинего фильтра
        * */
        $("#expanded-filter").submit(function (e) {
            //@todo нужно передать данные фильтра сюда
            getTizers(addTizers, "", true);
            e.preventDefault();
        });

        /*
        * Выделение тизера при зажатом ctrl/comand
        * Показ подробной информации о тизере
        * */
        $('body').on('click', ".b-tizer", function(e){
            if(e.ctrlKey === true || e.metaKey === true) {
                var $tizer = $(this);
                $tizer.hasClass("selected") ?  $tizer.removeClass('selected') : $tizer.addClass('selected');
                showCountTizersBar();
            } else {
                showDetalisBlock($(this));
            }
            return false;
        });

        /*
        * Удаление блок "Подробнее" при ресайзе
        * */
        $(window).resize(function(){
            $('.b-tdetalis').stop().slideUp('fast', function(){
                $(this).remove();
            });
            setTizerWidth();
        });

        /*
         * Добавление тизера в проект
         *
         * требует доработки. Нужно передавать потом масив
         * тизеров(когда мы выделяем при помощи зажатого ctrl
         * */
        $('body').on('click', '.js-add-to-projekt', function(){
            var tizerId = $(this).closest('.b-tdetalis').data('id'),
                $tizer = $("#"+tizerId);
            if($tizer.hasClass("selected")){
                $tizer.removeClass('selected');
                $(this).html(addtext);
            } else {
                $tizer.addClass('selected');
                $(this).html(deltext);
            }
            showCountTizersBar();
            return false;
        });

        /*
        * Закрывает подробное описание при клике по кнопке
        * */
        $('body').on('click', '.js-close-detalis', function(){
            $(this).closest('.b-tdetalis').stop().slideUp('fast', function(){
                $(this).remove();
            });
            return false;
        });

        /**
         * Устанавливает ширину тизеров в зависимости от ширины контейнера
         */
        function setTizerWidth(){
            if($tizers.length){
                if(!window.tizerWidth )tizerWidth = parseInt($tizers.css('minWidth'));
                tizerContainerW = $tizerContainer.outerWidth(true);
                tizerCount = Math.floor(tizerContainerW/tizerWidth);
                $tizers.outerWidth(100/tizerCount+"%");
            }
        }

        /**
         * Получает тизеры с выбраного источника и генерирует мапсив с тизерами.
         * Также обновляет переменную со всеми тизерами на странице.
         *
         * @todo сделать обработку ошибок
         * @function вызываеться после успешного получения ответа.
         * @function вызываеться в случае ошибки.
         * @param {boolean} очистить список тизеров или добавить в конец
         * @param {string} ссылка для получения тизеров.
         * @param {number} количество тизеров.
         * @param {number} Начальная позиция.
         * @param {object} дополнительные get параметры.
         *
         */
        function getTizers(done, fail, clean, link, tizers, start, others) {
            if(typeof done == "undefined" || done == "") return false;
            if(typeof fail == "undefined" || fail == "") fail = function(){};
            if(typeof link == "undefined" || link == "") link = defaultTizerLink;
            if(typeof clean == "undefined" || clean == "") clean = false;
            if(typeof tizers == "undefined" || tizers == "") tizers= 20;
            if(typeof start == "undefined" || start == "") start = 0 ;
            if(typeof others == "undefined") {
                others = "";
            } else {
                var otherGet = "";
                for(var key in others) {
                    otherGet += key+"="+others[key];
                }
            };

            var dataArr = [];
            $.ajax({
                url: link+"?tizers="+tizers+"&start="+start,
                dataType: 'json',
                beforeSend: function(){
                    $tizerPreloader.css('opacity', 1);
                    inProcess = true;
                    if(clean) $tizerContainer.html("");
                    console.log(clean);
                },
                success: function(data){
                    for(var key in data) {
                        tizersAll[key] = data[key];
                        dataArr.push(data[key]);
                    }
                    done(dataArr);
                },
                error: function(){
                    alert("fail");
                },
                complete:function(){
                    inProcess = false;
                    $tizerPreloader.css('opacity', 0);
                }
            });

        }

        /**
         * Добавляет тизеры на страницу
         *
         * @param {object} Массив с тизерами
         * @param {boolean} очистить список тизеров или добавить в конец
         */
        function addTizers(tizers, clean){
            $tizerContainer.append($tizerTemplate.render(tizers));
            $tizers = $('.b-tizer');
            setTizerWidth();
        }

        /*
        * Функция склонения целых числительных
        *
        * @param {number} число
        * @param {boolean} массив слов для склонения
        *
        * @return {string}
        * */
        function declOfNum(number, titles)
        {
            cases = [2, 0, 1, 1, 1, 2];
            return titles[ (number%100>4 && number%100<20)? 2 : cases[(number%10<5)?number%10:5] ];
        }

        /*
         * Показывае/скрывает полоску с количеством выбраных тизеров
         * */
        function showCountTizersBar() {
            var total = $('.b-tizer.selected').length;
            var tizerBar = $('.b-tizer-bar');
            if (total > 0){
                if(!tizerBar.hasClass('open')) tizerBar.addClass('open');
                $('.total-tizers').html(total+" "+declOfNum(total, ["тизер", "тизера", "тизеров"]));
            } else {
                tizerBar.removeClass('open');
            }

            var detalisBlock = $('.b-tdetalis');
            if(detalisBlock.length){
                setTimeout (function(){
                    detalisBlockPositioning(detalisBlock);
                }, parseFloat(detalisBlock.css("transition-duration"))*1000+500);
            }
        }

        /*
         * Показывает подробную информацию о тизере
         *
         * @param {object} тизер по которуму кликнули
         * */
        function showDetalisBlock(tizer) {
            var id = tizer.attr("id");
            var detalis = $('.b-tdetalis');
            var insertAfterIndex = Math.ceil((tizer.index()+1)/tizerCount)*tizerCount-1;
            var afterEl = ".b-tizer:eq("+insertAfterIndex+")";
            var content = [tizersAll[id]];
            console.log(content);
            if(detalis.length){
                detalis.stop().slideUp('fast', function(){
                    $(this).remove();
                    $($tizerMoreTemplate.render(content)).insertAfter(afterEl).stop().slideDown('fast', function(){
                        detalisBlockPositioning($(this));
                    });
                });
            } else {
                $($tizerMoreTemplate.render(content)).insertAfter(afterEl).stop().slideDown('fast', function(){
                    detalisBlockPositioning($(this));
                });
            }
        }

        /*
         * Позиционирует страницу относительно блока "подробнее"
         *
         * @param {object} блок "подробнее"
         * */
        function detalisBlockPositioning(block){
            var position = block.position(),
                winHeight,
                blockHeight = block.outerHeight(true),
                bottomPosition = position.top + blockHeight;
            winHeight = $tizerBar.hasClass('open') ? $(window).height() - $tizerBar.outerHeight(true)-parseInt($tizerBar.css('bottom')) : $(window).height();
            if(bottomPosition > winHeight){
                $('html,body').animate({
                    scrollTop: bottomPosition - winHeight
                }, 500);
            }
        }
     });

    $(window).load(function() {
         
    });
}(jQuery));