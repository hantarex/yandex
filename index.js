var MyForm = {
    fio:"fio",
    email:"email",
    phone:"phone",
    result:{},
    emailDomain:[
        '@ya.ru',
        '@yandex.ru',
        '@yandex.ua',
        '@yandex.by',
        '@yandex.kz',
        '@yandex.com'
    ],
    phoneDigitSumLimit:30,
    errorClass:"error",

    validateFio:function(){
        var re=/^[\wа-яА-ЯЁё]+\s[\wа-яА-ЯЁё]+\s[\wа-яА-ЯЁё]+$/;
        var fio=this.getData()[this.fio];
        if(!re.test(fio)) this.result[this.fio]="Это поле должно состоять из 3х слов";
        else delete this.result[this.fio];
    },
    checkDomain: function (domain) {
        var length = this.emailDomain.length;
        for(var i = 0; i < length; i++) {
            if(this.emailDomain[i] == domain) return true;
        }
        return false;
    },
    validateEmail:function(){
        var re=/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        var reDomain=/(@\w+([\.-]?\w+)*(\.\w{2,3})+)$/;
        var email=this.getData()[this.email];
        if(!re.test(email)) {
            this.result[this.email]="Неверный формат email";
        } else if(!this.checkDomain(reDomain.exec(email)[0])) {
            this.result[this.email]="Домен почты неверный";
        } else {
            delete this.result[this.email];
        }
    },
    sumDigitsPhone: function (phone) {
        var re=/(\d)/g;
        var digits=phone.match(re);
        var sum = digits.reduce(function(a, b) { return parseInt(a) + parseInt(b); }, 0);
        return sum;
    },
    validatePhone:function(){
        var re=/^\+7\(\d{3}\)\d{3}-\d{2}-\d{2}$/;
        var phone=this.getData()[this.phone];
        if(!re.test(phone)) {
            this.result[this.phone]="Неверный формат ввода телефона";
        } else if(this.sumDigitsPhone(phone)>this.phoneDigitSumLimit) {
            this.result[this.phone]="Сумма цифр больше "+this.phoneDigitSumLimit;
        } else {
            delete this.result[this.phone];
        }
    },
    getData: function(){
        var dataObject={};
        $.each($("#form input"),function(key,value){
            var name=$(value).attr("name");
            var val=$(value).val();
            if(name!==undefined) dataObject[name]=val;
        });
        return dataObject;
    },
    setData: function(dataObject){
        $.each(dataObject,function(key,val){
            switch (key){
                case "phone":
                case "fio":
                case "email":
                    $("#form input[name="+key+"]").val(val);
                    break;
                default:
            }
        });
    },
    validate:function () {
        $("input[name="+this.fio+"]").removeClass(this.errorClass);
        $("input[name="+this.email+"]").removeClass(this.errorClass);
        $("input[name="+this.phone+"]").removeClass(this.errorClass);
        this.validateFio();
        this.validateEmail();
        this.validatePhone();

        var resultObject={
            isValid:true,
            errorFields:[]
        };

        $.each(this.result,function (index, value) {
            $("input[name="+index+"]").addClass(MyForm.errorClass);
            resultObject.errorFields.push(index);
            resultObject.isValid=false;

        });

        return resultObject;
    },
    processRequest:function (form) {
        $("#submitButton").prop('disabled', true);
        var resultContainer=$("#resultContainer");
        var that=this;
        var url="json/success.json";
        // var url="json/error.json";
        // var url="json/progress.json";
        $.ajax({
            url:url,
            type:"json",
            method:"get",
            data:form.serialize(),
            success:function(html){
                switch(html.status){
                    case "success":
                        resultContainer.removeClass("progress").addClass("success");
                        resultContainer.html("Success");
                        break;
                    case "error":
                        resultContainer.removeClass("progress").addClass("error");
                        resultContainer.html(html.reason);
                        break;
                    default: //progress
                        resultContainer.addClass("progress");
                        setTimeout(function () {
                            that.processRequest(form);
                        }, html.timeout);
                }
            }
        });
    },
    submit:function(){
        var result=this.validate();
        if(!result.isValid) {
            $.each(result.errorFields,function (index, value) {
                $("input[name="+value+"]").addClass(MyForm.errorClass);
            });
        } else {
            MyForm.processRequest($("#form"));
        }
    }
};

$(function(){
    // Заполняем форму
    // var valueForm={
    //     'fio':'Иванов Иван Иванович',
    //     'email':'yandex@yandex.ru',
    //     'phone':'+7(111)111-11-11'
    // };
    // MyForm.setData(valueForm);

    $("body").on("click","#submitButton",function(){
        MyForm.submit();
        return false;
    });
});
